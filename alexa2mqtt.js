var pkg = require('./package.json');
var config = require('yargs')
  .env('FAKEHUE')
  .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
  .describe('v', 'possible values: "error", "warn", "info", "debug"')
  .describe('n', 'instance name. used as mqtt client id and as prefix for connected topic')
  .describe('u', 'mqtt broker url. See https://github.com/mqttjs/MQTT.js#connect-using-a-url')
  .describe('p', 'port')
  .describe('k', 'binding adress')
  .describe('e', 'publishing host')
  .describe('c', 'configuration file')
  .describe('h', 'show help')
  .alias({
    'h': 'help',
    'n': 'name',
    'u': 'url',
    'b': 'bind',
    'e': 'publish',
    'p': 'port',
    'c': 'config',
    'v': 'verbosity'
  })
  .default({
    'u': 'mqtt://127.0.0.1',
    'n': 'fakehue',
    'v': 'info',
    'c': './config.yml'
  })
  .version()
  .help('help')
  .argv;

module.exports = config;
