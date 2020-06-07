import nconf from 'nconf';
import redis from 'redis';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import {
  TooManyRequests,
} from '../libs/errors';
import logger from '../libs/logger';
import apiError from '../libs/apiError';

// Middleware to rate limit requests to the API

//docs

const RATE_LIMITER_ENABLED = nconf.get('RATE_LIMITER_ENABLED') === 'true';
const REDIS_HOST = nconf.get('REDIS_HOST');
const REDIS_PASSWORD = nconf.get('REDIS_PASSWORD');
const REDIS_PORT = nconf.get('REDIS_PORT');

let redisClient;
let rateLimiter;

const rateLimiterOpts = {
  keyPrefix: 'api-v3',
  points: 30, // 30 requests
  duration: 60, // per 1 minute by User ID or IP
};

if (RATE_LIMITER_ENABLED) {
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
  });
}

function setResponseHeaders (res, rateLimiterRes) {
  res.set({
    'Retry-After': rateLimiterRes.msBeforeNext / 1000,
    'X-RateLimit-Limit': rateLimiterOpts.points,
    'X-RateLimit-Remaining': rateLimiterRes.remainingPoints,
    'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext),
  });
}

export default function rateLimiterMiddleware (req, res, next) {
  rateLimiter.consume(req.ip)
    .then(rateLimiterRes => {
      setResponseHeaders(res, rateLimiterRes);
      next();
    })
    .catch(rateLimiterRes => {
      if (rateLimiterRes instanceof RateLimiterRes) {
        setResponseHeaders(res, rateLimiterRes);
        next(new TooManyRequests(apiError('clientRateLimited')));
      } else {
        // In case of an unhandled error we skip the middleware as it could mean
        // , for example, that the connection to the redis database is not working.
        // We do not want to block all requests in these cases.
        logger.error(rateLimiterRes, 'Rate Limiter Error');
        next();
      }
    });
}
