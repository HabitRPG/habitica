import { model as ClientConfigOption } from '../models/clientConfigOption';
import { registerReloader, reload, invalidate } from './cacheInvalidation';

const CACHE_TYPE = 'clientConfig';
const RELOAD_INTERVAL = 60 * 1000;

export const CLIENT_PLATFORMS = ['web', 'ios', 'android'];
const MOBILE_PLATFORMS = ['ios', 'android'];

let cache = null;

function resolveValue (option, platform) {
  const values = option.values || [];
  const override = values.find(v => v.platform === platform)
    || (MOBILE_PLATFORMS.includes(platform) && values.find(v => v.platform === 'mobile'));
  return override ? override.value : option.defaultValue;
}

export function buildClientConfig (options, platform) {
  const config = {};
  options.forEach(option => {
    config[option.key] = resolveValue(option, platform);
  });
  return config;
}

async function reloadClientConfig () {
  const options = await ClientConfigOption
    .find({ enabled: true })
    .select('key defaultValue values')
    .lean()
    .exec();

  const newCache = {};
  CLIENT_PLATFORMS.forEach(platform => {
    newCache[platform] = buildClientConfig(options, platform);
  });
  cache = newCache;
}

registerReloader(CACHE_TYPE, reloadClientConfig, { interval: RELOAD_INTERVAL });

export async function getClientConfig (platform) {
  if (!cache) await reload(CACHE_TYPE);
  if (!cache) throw new Error('Client config could not be loaded');
  return cache[platform];
}

export function invalidateClientConfig () {
  return invalidate(CACHE_TYPE);
}
