#!/usr/bin/env node
var pkg = require('./package.json');
var fs = require('fs');
const Hapi = require('hapi');
var ssdp = require('peer-ssdp');
var Mqtt = require('mqtt');
var log = require('yalm');
var config = require('./config.js');
require('require-yaml');

var address = '192.168.1.124';
var host = '192.168.1.124';
var port = 8082;

var mqttConnected;

log.setLevel(config.verbosity);

log.info(pkg.name + ' ' + pkg.version + ' starting');

log.info('Config file: ' + config.config);
var alexaConfigFile = require(config.config).alexa;
log.debug(alexaConfigFile);

var alexaConfig = {};
var alexaMQTTConfig = {};
for (let index = 0; index < alexaConfigFile.length; index++) {
  const element = alexaConfigFile[index];
  alexaMQTTConfig[element.id] = {
    name: element.name,
    switch: element.switch,
    comntrol: element.comntrol
  };
  alexaConfig[element.id] = {
    'state': {
      'on': false,
      'bri': 0,
      'hue': 0,
      'sat': 0,
      'xy': [
        0,
        0
      ],
      'ct': 0,
      'alert': 'none',
      'effect': 'none',
      'colormode': 'hs',
      'reachable': true
    },
    'type': 'Extended color light',
    'name': element.name,
    'modelid': 'LCT001',
    'swversion': '66009461'
  };
}

log.info('mqtt trying to connect', config.url);

var mqtt = Mqtt.connect(config.url, {will: {topic: config.name + '/connected', payload: '0', retain: true}});

mqtt.on('connect', function () {
  mqttConnected = true;

  log.info('mqtt connected', config.url);
  mqtt.publish(config.name + '/connected', '1', {retain: true});

  log.info('mqtt subscribe', config.name + '/set/#');
  mqtt.subscribe(config.name + '/set/#');
});

mqtt.on('close', function () {
  if (mqttConnected) {
    mqttConnected = false;
    log.info('mqtt closed ' + config.url);
  }
});

mqtt.on('error', function (err) {
  log.error('mqtt', err);
});

var peer = ssdp.createPeer();

//  handle peer ready event. This event will be emitted after `peer.start()` is called.
peer.on('ready', function () {
  log.info('UPNP server listening on port 1900.');
});

// handle SSDP NOTIFY messages.
// param headers is JSON object containing the headers of the SSDP NOTIFY message as key-value-pair.
// param address is the socket address of the sender
peer.on('notify', function (headers, address) {
  log.debug('NOTIFY:', headers);
});

// handle SSDP M-SEARCH messages.
// param headers is JSON object containing the headers of the SSDP M-SEARCH message as key-value-pair.
// param address is the socket address of the sender
peer.on('search', function (headers, address) {
  // handle search request
  // reply to search request
  // {{networkInterfaceAddress}} will be replaced with the actual IP Address of the corresponding
  // sending the SSDP message with the actual IP Address of the corresponding
  // Network interface.
  log.debug('SEARCH:', headers, address);
  if (headers.ST && headers.MAN === '"ssdp:discover"') {
    peer.reply({
      NT: 'urn:schemas-upnp-org:device:basic:1',
      SERVER: 'node.js/0.10.28 UPnP/1.1',
      ST: 'urn:schemas-upnp-org:device:basic:1',
      USN: 'uuid:Socket-1_0-221438K0100073::urn:Belkin:device:**',
      LOCATION: 'http://{{networkInterfaceAddress}}:8082/upnp/amazon-ha-bridge/setup.xml'
    }, address);
  }
});

// handle SSDP HTTP 200 OK messages.
// param headers is JSON object containing the headers of the SSDP HTTP 200 OK  message as key-value-pair.
// param address is the socket address of the sender
peer.on('found', function (headers, address) {
  // handle found event
  log.info('FOUND:', headers);
});

// handle peer close event. This event will be emitted after `peer.close()` is called.
peer.on('close', function () {
  // handle close event
  log.info('CLOSING.');
});

// Start peer. Afer peer is ready the `ready` event will be emitted.
peer.start();

var setupFile = fs.readFileSync('setup.xml').toString();
setupFile.replace('##URLBASE##', host + ':' + port);

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  port: port,
  address: address
});

// Add the route
server.route({
  method: 'GET',
  path: '/api/{name}/lights',
  handler: function (request, reply) {
    log.info('LIGHTS', request.url.path);
    return reply(alexaConfig).type('application/json');
  }
});

// Add the route
server.route({
  method: 'GET',
  path: '/api/{name}/lights/{id}',
  handler: function (request, reply) {
    log.info('LIGHTS', request.url.path);
    var lightState = alexaConfig[request.params.id];
    if (lightState) {
      return reply(lightState).type('application/json');
    } else {
      return reply(400);
    }
  }
});

// Add the route
server.route({
  method: 'PUT',
  path: '/api/{name}/lights/{id}/state',
  handler: function (request, reply) {
    var command = JSON.parse(request.payload.toString());
    log.debug('PUT', request.url.path, command);
    log.INFO('command', request.params.id, command);
    var mqttConfifg = alexaMQTTConfig[request.params.id];
    if (mqttConfifg) {
      var topic = mqttConfifg.switch.topic;
      var value = mqttConfifg.switch.off;
      if (command.bri) {
        value = '' + command.bri / 2.55;
        topic = mqttConfifg.control.topic;
      } else if (command.on) {
        value = mqttConfifg.switch.on;
      }
      mqtt.publish(topic, value, function () {
        log.debug('meta', topic, value);
      });
    }
    var response = [{
      success: {
        ['/lights/' + request.params.id + '/state/on']: true
      }
    }];
    log.debug(response);
    return reply(response).type('application/json');
  },
  config: {
    payload: {
      output: 'data',
      parse: false
    }
  }

});

// Add the route
server.route({
  method: 'GET',
  path: '/upnp/amazon-ha-bridge/setup.xml',
  handler: function (request, reply) {
    log.info('SETUP', request.url.path);
    return reply(setupFile).type('application/xml');
  }
});

// Add the route
server.route({
  method: '*',
  path: '/{path*}',
  handler: function (request, reply) {
    log.error('MISC', request.method, request.url.path);
    return reply(400);
  }
});

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  }
  log.info('Server running at:', server.info.uri);
});
