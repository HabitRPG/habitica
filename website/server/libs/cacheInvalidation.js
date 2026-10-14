import nconf from 'nconf';
import logger from './logger';
import setupRedis from './redis';

const CHANNEL = 'cache:invalidate';
const IS_TEST = nconf.get('IS_TEST');
const ENABLED = nconf.get('CACHE_INVALIDATION_ENABLED') === 'true';

const reloaders = {};
let publisher;

export function reload (type) {
  const entry = reloaders[type];
  if (!entry) return Promise.resolve();
  if (entry.running) {
    entry.pending = true;
    return entry.running;
  }

  entry.running = (async () => {
    do {
      entry.pending = false;
      try {
        await entry.reload(); // eslint-disable-line no-await-in-loop
      } catch (err) {
        logger.error(err, `Error reloading cache "${type}"`);
      }
    } while (entry.pending);
    entry.running = null;
  })();
  return entry.running;
}

function reloadAll () {
  return Promise.all(Object.keys(reloaders).map(reload));
}

export function registerReloader (type, reloadFn, { interval } = {}) {
  reloaders[type] = { reload: reloadFn, running: null, pending: false };
  if (interval) {
    setInterval(() => reload(type), interval).unref();
  }
}

export async function invalidate (type) {
  await reload(type);
  if (publisher) {
    try {
      await publisher.publish(CHANNEL, JSON.stringify({ type }));
    } catch (err) {
      logger.error(err, `Error publishing cache invalidation for "${type}"`);
    }
  }
}

if (ENABLED && !IS_TEST) {
  const connectionOptions = {
    host: nconf.get('REDIS_HOST'),
    password: nconf.get('REDIS_PASSWORD'),
    port: nconf.get('REDIS_PORT'),
  };

  publisher = setupRedis(connectionOptions, { enableOfflineQueue: false });
  publisher.on('error', err => logger.error(err, 'Cache invalidation publisher Redis error'));

  const subscriber = setupRedis(connectionOptions, {});
  subscriber.on('error', err => logger.error(err, 'Cache invalidation subscriber Redis error'));
  // Messages may have been missed while disconnected
  subscriber.on('ready', () => reloadAll());
  subscriber.on('message', (channel, message) => {
    try {
      const { type } = JSON.parse(message);
      reload(type);
    } catch (err) {
      logger.error(err, 'Invalid cache invalidation message');
    }
  });
  subscriber.subscribe(CHANNEL).catch(err => logger.error(err, 'Error subscribing to cache invalidation'));
}
