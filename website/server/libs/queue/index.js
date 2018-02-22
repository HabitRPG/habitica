import Kafka from 'node-rdkafka';
import nconf from 'nconf';

const kafkaConf = {
  'group.id': nconf.get('KAFKA:GROUP_ID'),
  'metadata.broker.list': nconf.get('KAFKA:CLOUDKARAFKA_BROKERS').split(','),
  'socket.keepalive.enable': true,
  'security.protocol': 'SASL_SSL',
  'sasl.mechanisms': 'SCRAM-SHA-256',
  'sasl.username': nconf.get('KAFKA:CLOUDKARAFKA_USERNAME'),
  'sasl.password': nconf.get('KAFKA:CLOUDKARAFKA_PASSWORD'),
  debug: 'generic,broker,security',
};

const prefix = nconf.get('KAFKA:CLOUDKARAFKA_TOPIC_PREFIX');
const topic = `${prefix}-default`;
const producer = new Kafka.Producer(kafkaConf);

producer.connect();

process.on('exit', () => {
  if (producer.isConnected()) producer.disconnect();
});

const api = {};

api.sendMessage = function sendMessage (message, key) {
  if (!producer.isConnected()) return;

  try {
    producer.produce(topic, -1, new Buffer(message), key);
  } catch (e) {
    // @TODO: Send the to loggly?
  }
};

module.exports = api;
