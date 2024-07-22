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

// Middleware to rate limit requests to the API

// More info on the API rate limits can be found on the wiki at
// https://habitica.fandom.com/wiki/Guidance_for_Comrades#Rules_for_Third-Party_Tools

const IS_TEST = nconf.get('IS_TEST');
const RATE_LIMITER_ENABLED = nconf.get('RATE_LIMITER_ENABLED') === 'true';
const RATE_LIMITER_IN_MEMORY = nconf.get('RATE_LIMITER_IN_MEMORY') === 'true';
const REDIS_HOST = nconf.get('REDIS_HOST');
const REDIS_PASSWORD = nconf.get('REDIS_PASSWORD');
const REDIS_PORT = nconf.get('REDIS_PORT');
const LIVELINESS_PROBE_KEY = nconf.get('LIVELINESS_PROBE_KEY');
const REGISTRATION_COST = nconf.get('RATE_LIMITER_REGISTRATION_COST') || 5;
const IP_RATE_LIMIT_COST = nconf.get('RATE_LIMITER_IP_COST') || 2;

const REGISTER_CALLS = [
  '/api/v4/user/auth/local/register',
  '/api/v3/user/auth/local/register',
];
const AUTH_CALLS = [
  '/api/v4/user/auth/local/register',
  '/api/v3/user/auth/local/register',
  '/api/v4/user/auth/local/login',
  '/api/v3/user/auth/local/login',
];

let redisClient;
let rateLimiter;
let authLimiter;

const rateLimiterOpts = {
  keyPrefix: 'api-v3',
  points: 30, // 30 requests
  duration: 60, // per 1 minute by User ID or IP
};

const authLimiterOpts = {
  keyPrefix: 'api-auth',
  points: 10,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24,
};

if (RATE_LIMITER_ENABLED) {
  if (IS_TEST || RATE_LIMITER_IN_MEMORY) {
    rateLimiter = new RateLimiterMemory({
      ...rateLimiterOpts,
    });
    authLimiter = new RateLimiterMemory({
      ...authLimiterOpts,
    });
  } else {
    redisClient = redis.createClient({
      host: REDIS_HOST,
      password: REDIS_PASSWORD,
      port: REDIS_PORT,
      enable_offline_queue: false,
    });

    redisClient.on('error', error => {
      logger.error(error, 'Redis Error');
    });

    rateLimiter = new RateLimiterRedis({
      ...rateLimiterOpts,
      storeClient: redisClient,
      inMemoryBlockOnConsumed: 10,
    });
    authLimiter = new RateLimiterRedis({
      ...authLimiterOpts,
      storeClient: redisClient,
    });
  }
}

function setResponseHeaders (res, rateLimiterRes, limit) {
  const headers = {
    'X-RateLimit-Limit': limit || rateLimiterOpts.points,
    'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
    'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
  };

  if (rateLimiterRes.remainingPoints < 1) {
    headers['Retry-After'] = rateLimiterRes.msBeforeNext / 1000;
  }

  res.set(headers);
}

export async function middleware (req, res, next) {
  if (!RATE_LIMITER_ENABLED) return next();
  if (LIVELINESS_PROBE_KEY && req.query.liveliness === LIVELINESS_PROBE_KEY) return next();

  const userId = req.header('x-api-user');

  let cost = 1;
  let isAuth = false;
  if (AUTH_CALLS.indexOf(req.path) !== -1) {
    isAuth = true;
    let retrySecs = 0;
    const authRateLimiterRes = await authLimiter.get(req.ip);

    if (authRateLimiterRes !== null && authRateLimiterRes.consumedPoints > 10) {
      retrySecs = Math.round(authRateLimiterRes.msBeforeNext / 1000) || 1;
    }
    if (retrySecs > 0) {
      setResponseHeaders(res, authRateLimiterRes, authLimiterOpts.points);
      return next(new TooManyRequests(apiError('clientRateLimited')));
    }
    if (REGISTER_CALLS.indexOf(req.path) !== -1) {
      cost = REGISTRATION_COST;
    }
  } else if (!userId) {
    cost *= IP_RATE_LIMIT_COST;
  }
  return rateLimiter.consume(userId || req.ip, cost)
    .then(async rateLimiterRes => {
      const r = next();
      if (isAuth) {
        const authRateLimiterRes = await authLimiter.consume(req.ip);
        setResponseHeaders(res, authRateLimiterRes, authLimiterOpts.points);
      } else {
        setResponseHeaders(res, rateLimiterRes, rateLimiterOpts.points);
      }
      return r;
    })
    .catch(rateLimiterRes => {
      if (rateLimiterRes instanceof RateLimiterRes) {
        setResponseHeaders(res, rateLimiterRes, rateLimiterOpts.points);
        return next(new TooManyRequests(apiError('clientRateLimited')));
      }

      // In case of an unhandled error we skip the middleware as it could mean
      // , for example, that the connection to the redis database is not working.
      // We do not want to block all requests in these cases.
      logger.error(rateLimiterRes, 'Rate Limiter Error');
      return next();
    });
}

export async function rateLimitErrors (req, res, next) {
  if (AUTH_CALLS.indexOf(req.path) !== -1) {
    try {
      const authRateLimiterRes = await authLimiter.consume(req.ip);
      setResponseHeaders(res, authRateLimiterRes, authLimiterOpts.points);
    } catch (rateLimiterRes) {
      if (rateLimiterRes instanceof RateLimiterRes) {
        setResponseHeaders(res, rateLimiterRes, authLimiterOpts.points);
        return next(new TooManyRequests(apiError('clientRateLimited')));
      }
    }
  }
  return undefined;
}
