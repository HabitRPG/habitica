import Kafka from 'node-rdkafka';
import nconf from 'nconf';

const GROUP_ID = nconf.get('KAFKA:GROUP_ID');
const CLOUDKARAFKA_BROKERS = nconf.get('KAFKA:CLOUDKARAFKA_BROKERS');
const CLOUDKARAFKA_USERNAME = nconf.get('KAFKA:CLOUDKARAFKA_USERNAME');
const CLOUDKARAFKA_PASSWORD = nconf.get('KAFKA:CLOUDKARAFKA_PASSWORD');
const CLOUDKARAFKA_TOPIC_PREFIX = nconf.get('KAFKA:CLOUDKARAFKA_TOPIC_PREFIX');

const prefix = CLOUDKARAFKA_TOPIC_PREFIX;
const topic = `${prefix}-default`;
let producer;

function createProducer () {
  const kafkaConf = {
    'group.id': GROUP_ID,
    'metadata.broker.list': CLOUDKARAFKA_BROKERS ? CLOUDKARAFKA_BROKERS.split(',') : '',
    'socket.keepalive.enable': true,
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'SCRAM-SHA-256',
    'sasl.username': CLOUDKARAFKA_USERNAME,
    'sasl.password': CLOUDKARAFKA_PASSWORD,
    debug: 'generic,broker,security',
  };

  producer = new Kafka.Producer(kafkaConf);

  producer.connect();
}

if (GROUP_ID && CLOUDKARAFKA_BROKERS && CLOUDKARAFKA_USERNAME && CLOUDKARAFKA_PASSWORD && CLOUDKARAFKA_TOPIC_PREFIX) {
  createProducer();
}

process.on('exit', () => {
  if (producer && producer.isConnected()) producer.disconnect();
});

const api = {};

api.sendMessage = function sendMessage (message, key) {
  if (!producer || !producer.isConnected()) return;

  try {
    producer.produce(topic, -1, new Buffer(JSON.stringify(message)), key);
  } catch (e) {
    // @TODO: Send the to loggly?
  }
};

module.exports = api;
