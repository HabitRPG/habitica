import nconf from 'nconf';
import uniq from 'lodash/uniq';
import { model as ClientConfigOption } from '../models/clientConfigOption';
import { model as ClientConfigSegment } from '../models/clientConfigSegment';
import { registerReloader, reload, invalidate } from './cacheInvalidation';
import { compileSegment, getSegmentUserFields } from './clientConfigTargeting';

const CACHE_TYPE = 'clientConfig';
const RELOAD_INTERVAL = nconf.get('CLIENT_CONFIG_RELOAD_INTERVAL') || (30 * 60 * 1000);
// Upper bound for the number of cached platform/segment combinations
const MAX_RESOLVED_CONFIGS = 1000;

export const CLIENT_PLATFORMS = ['web', 'ios', 'android'];
const MOBILE_PLATFORMS = ['ios', 'android'];

let cache = null;

// More specific overrides win: any matching segment beats platform-only overrides,
// and an exact platform beats `mobile`. Ties are resolved by order in `values`.
function overrideScore (override, platform, matchedSegments) {
  let score = 0;
  if (override.segment) {
    if (!matchedSegments.has(override.segment)) return -1;
    score += 4;
  }
  if (override.platform === platform) {
    score += 2;
  } else if (override.platform === 'mobile' && MOBILE_PLATFORMS.includes(platform)) {
    score += 1;
  } else if (override.platform) {
    return -1;
  }
  return score;
}

function resolveValue (option, platform, matchedSegments) {
  let best = null;
  let bestScore = 0;
  (option.values || []).forEach(override => {
    const score = overrideScore(override, platform, matchedSegments);
    if (score > bestScore) {
      best = override;
      bestScore = score;
    }
  });
  return best ? best.value : option.defaultValue;
}

export function buildClientConfig (options, platform, matchedSegments = new Set()) {
  const config = {};
  options.forEach(option => {
    config[option.key] = resolveValue(option, platform, matchedSegments);
  });
  return config;
}

async function reloadClientConfig () {
  const options = await ClientConfigOption
    .find({ enabled: true })
    .select('key defaultValue values')
    .lean()
    .exec();

  const segmentIds = uniq(options
    .flatMap(option => (option.values || []).map(v => v.segment))
    .filter(Boolean));
  const segments = segmentIds.length === 0 ? [] : await ClientConfigSegment
    .find({ _id: { $in: segmentIds } })
    .select('conditions')
    .lean()
    .exec();

  const resolved = new Map();
  CLIENT_PLATFORMS.forEach(platform => {
    resolved.set(`${platform}|`, buildClientConfig(options, platform));
  });

  cache = {
    options,
    segments: segments.map(segment => ({ id: segment._id, test: compileSegment(segment) })),
    userFields: uniq(segments.flatMap(getSegmentUserFields)),
    resolved,
  };
}

registerReloader(CACHE_TYPE, reloadClientConfig, { interval: RELOAD_INTERVAL });

export async function loadClientConfig () {
  if (!cache) await reload(CACHE_TYPE);
  if (!cache) throw new Error('Client config could not be loaded');
}

// Whether any enabled option is targeted at a segment, meaning the user has to be loaded
export function hasTargeting () {
  return Boolean(cache && cache.segments.length > 0);
}

// The user fields needed to evaluate all active segments
export function getTargetingUserFields () {
  return cache ? [...cache.userFields] : ['_id'];
}

export async function getClientConfig (platform, user) {
  await loadClientConfig();
  const { options, segments, resolved } = cache;

  const matched = user ? segments.filter(segment => segment.test(user)).map(s => s.id) : [];
  const cacheKey = `${platform}|${matched.join(',')}`;

  let config = resolved.get(cacheKey);
  if (!config) {
    config = buildClientConfig(options, platform, new Set(matched));
    if (resolved.size >= MAX_RESOLVED_CONFIGS) resolved.clear();
    resolved.set(cacheKey, config);
  }
  return config;
}

export function invalidateClientConfig () {
  return invalidate(CACHE_TYPE);
}
