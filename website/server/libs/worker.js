import nconf from 'nconf';
import { Queue } from 'bullmq';
import setupRedis from './redis';
import SERVER_STATUS from './serverStatus';

let redisClient;
const queues = {};

if (nconf.get('WORKER_REDIS_URL')) {
  redisClient = setupRedis({
    url: nconf.get('WORKER_REDIS_URL'),
    username: nconf.get('WORKER_REDIS_USERNAME'),
    password: nconf.get('WORKER_REDIS_PASSWORD'),
  });

  redisClient.on('ready', () => {
    SERVER_STATUS.WORKER = true;
  });

  redisClient.on('reconnecting', () => {
    SERVER_STATUS.WORKER = false;
  });

  queues.email = new Queue('emails', {
    connection: redisClient,
  });
  queues.deleteUser = new Queue('DeleteUsers', {
    connection: redisClient,
  });
} else {
  SERVER_STATUS.WORKER = true;
}

function sendJob (type, config) {
  if (!queues[type]) {
    return Promise.reject(new Error(`Queue ${type} does not exist`));
  }
  const { identifier, data } = config;
  return queues[type].add(identifier, data);
}

export function getRedisClient () {
  return redisClient;
}

export default { sendJob };
