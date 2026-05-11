import nconf from 'nconf';
import redis from 'redis';
import {
  RateLimiterRedis,
  RateLimiterMemory,
  RateLimiterRes,
} from 'rate-limiter-flexible';
import {
  TooManyRequests,
} from '../libs/errors';
import logger from '../libs/logger';
import { apiError } from '../libs/apiError';
import SERVER_STATUS from '../libs/serverStatus';

// Middleware to rate limit requests to the API

// More info on the API rate limits can be found on the wiki at
// https://habitica.fandom.com/wiki/Guidance_for_Comrades#Rules_for_Third-Party_Tools

const IS_TEST = nconf.get('IS_TEST');
const RATE_LIMITER_ENABLED = nconf.get('RATE_LIMITER_ENABLED') === 'true';
const REDIS_HOST = nconf.get('REDIS_HOST');
const REDIS_PASSWORD = nconf.get('REDIS_PASSWORD');
const REDIS_PORT = nconf.get('REDIS_PORT');
const LIVELINESS_PROBE_KEY = nconf.get('LIVELINESS_PROBE_KEY');
const BASE_POINTS = nconf.get('RATE_LIMITER_BASE_POINTS') || 30;
const BASE_DURATION = nconf.get('RATE_LIMITER_BASE_DURATION') || 60;
const REGISTRATION_COST = nconf.get('RATE_LIMITER_REGISTRATION_COST') || 10;
const LOGIN_COST = nconf.get('RATE_LIMITER_LOGIN_COST') || 10;
const IP_RATE_LIMIT_COST = nconf.get('RATE_LIMITER_IP_COST') || 5;

let redisClient;

if (RATE_LIMITER_ENABLED && !IS_TEST) {
  redisClient = redis.createClient({
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    port: REDIS_PORT,
    enable_offline_queue: false,
  });

  redisClient.on('ready', () => {
    SERVER_STATUS.REDIS = true;
  });

  redisClient.on('reconnecting', () => {
    SERVER_STATUS.REDIS = false;
  });

  redisClient.on('error', error => {
    logger.error(error, 'Redis Error');
  });
} else {
  SERVER_STATUS.REDIS = true;
}

function setResponseHeaders (res, points, rateLimiterRes) {
  const headers = {
    'X-RateLimit-Limit': points,
    'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
    'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
  };

  if (rateLimiterRes.remainingPoints < 1) {
    headers['Retry-After'] = rateLimiterRes.msBeforeNext / 1000;
  }

  res.set(headers);
}

export default function setupRateLimiter (options = {}) {
  const rateLimiterOpts = {
    keyPrefix: options.keyPrefix || 'api',
    points: options.points || BASE_POINTS, // 30 requests
    duration: options.duration || BASE_DURATION, // per 1 minute by User ID or IP
  };
  let rateLimiter;
  if (!RATE_LIMITER_ENABLED) {
    return (req, res, next) => next();
  }
  if (IS_TEST) {
    rateLimiter = new RateLimiterMemory({
      ...rateLimiterOpts,
    });
  } else {
    rateLimiter = new RateLimiterRedis({
      ...rateLimiterOpts,
      storeClient: redisClient,
    });
  }
  return function rateLimiterMiddleware (req, res, next) {
    if (!RATE_LIMITER_ENABLED) return next();
    if (LIVELINESS_PROBE_KEY && req.query.liveliness === LIVELINESS_PROBE_KEY) return next();

    const userId = req.header('x-api-user');

    let cost = 1;
    const url = req.path || '';
    if (url.indexOf('/user/auth/local/register') > 0) {
      cost = options.registrationCost || REGISTRATION_COST;
    } else if (url.indexOf('/user/auth/local/login') > 0) {
      cost = options.loginCost || LOGIN_COST;
    } else if (url.indexOf('/user/auth/verify-username') > 0) {
      cost = 1; // Verifying username might happen multiple times during typing
    } else if (!userId) {
      cost = options.ipRateLimitCost || IP_RATE_LIMIT_COST;
    }

    return rateLimiter.consume(userId || req.ip, cost)
      .then(rateLimiterRes => {
        setResponseHeaders(res, rateLimiterOpts.points, rateLimiterRes);
        return next();
      })
      .catch(rateLimiterRes => {
        if (rateLimiterRes instanceof RateLimiterRes) {
          setResponseHeaders(res, rateLimiterOpts.points, rateLimiterRes);
          return next(new TooManyRequests(apiError('clientRateLimited')));
        }

        // In case of an unhandled error we skip the middleware as it could mean
        // , for example, that the connection to the redis database is not working.
        // We do not want to block all requests in these cases.
        logger.error(rateLimiterRes, 'Rate Limiter Error');
        return next();
      });
  };
}
