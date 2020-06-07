import nconf from 'nconf';
import redis from 'redis';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import {
  Forbidden,
} from '../libs/errors';
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
    console.error(error);//todo, prevent rate limiter creation on error
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
      console.log(rateLimiterRes);
      setResponseHeaders(res, rateLimiterRes);
      next();
    })
    .catch(rateLimiterRes => {
      if (rateLimiterRes instanceof RateLimiterRes) {
        setResponseHeaders(res, rateLimiterRes);
        res.status(429).send('Too Many Requests');
      } else {
        next(rateLimiterRes);
        //handle unhandled error, skip?
      }
    });
}
