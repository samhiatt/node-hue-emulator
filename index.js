#!/usr/bin/env node
var fs = require('fs');
const Hapi = require('hapi');
var ssdp = require('peer-ssdp');
var peer = ssdp.createPeer();

//  handle peer ready event. This event will be emitted after `peer.start()` is called.
peer.on('ready', function () {
  console.log('UPNP server listening on port 1900.');
});

// handle SSDP NOTIFY messages.
// param headers is JSON object containing the headers of the SSDP NOTIFY message as key-value-pair.
// param address is the socket address of the sender
peer.on('notify', function (headers, address) {
  // console.log('NOTIFY:', headers)
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
  // console.log('SEARCH:', headers, address)
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
  console.log('FOUND:', headers);
});

// handle peer close event. This event will be emitted after `peer.close()` is called.
peer.on('close', function () {
  // handle close event
  console.log('CLOSING.');
});

// Start peer. Afer peer is ready the `ready` event will be emitted.
peer.start();

var config = JSON.parse(fs.readFileSync('config.json'));

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  port: 8082,
  address: '192.168.1.124'
});

// Add the route
server.route({
  method: 'GET',
  path: '/api/{name}/lights',
  handler: function (request, reply) {
    console.log('LIGHTS', request.url.path);
    return reply(config).type('application/json');
  }
});

// Add the route
server.route({
  method: 'GET',
  path: '/api/{name}/lights/{id}',
  handler: function (request, reply) {
    console.log('LIGHTS', request.url.path);
    var lightState = config[request.params.id];
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
    console.log('PUT', request.url.path, command);
    var response = [{
      success: {
        ['/lights/' + request.params.id + '/state/on']: true
      }
    }];
    console.log(response);
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
    console.log('SETUP', request.url.path);
    var setup = fs.readFileSync('setup.xml');
    return reply(setup).type('application/xml');
  }
});

// Add the route
server.route({
  method: '*',
  path: '/{path*}',
  handler: function (request, reply) {
    console.log('MISC', request.method, request.url.path);
    return reply(400);
  }
});

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
