import nconf from 'nconf';
import Redis from 'ioredis';

import {
  model as User,
} from '../models/user';

const REDIS_URL = nconf.get('REDIS_URL');
let redisClient;

if (REDIS_URL) {
  redisClient = new Redis(REDIS_URL);
}

async function getUserWithToken (userId, apiToken, fields, request) {
  const userQuery = {
    _id: userId,
    apiToken,
  };

  // if request no equal to get or if not redisClient
  const allowedRoutes = ['/user'];
  if (request.method !== 'GET' || !redisClient || allowedRoutes.indexOf(request.route.path) === -1) {
    return fields ? User.findOne(userQuery).select(fields).exec() : User.findOne(userQuery).exec();
  }

  const userKey = `${userId}-${apiToken}`;
  const user = await redisClient.get(userKey);

  if (!user) {
    const userPromise = fields ? User.findOne(userQuery).select(fields).exec() : User.findOne(userQuery).exec();
    const userDoc = await userPromise;

    redisClient.set(userKey, JSON.stringify(userDoc.toJSON()), 'EX', 60 * 60 * 24);

    return new Promise((resolve) => resolve(userDoc));
  }

  return new Promise((resolve) => resolve(JSON.parse(user)));
}

function setUserCache (userDoc) {
  const userKey = `${userDoc._id}-${userDoc.apiToken}`;
  redisClient.set(userKey, JSON.stringify(userDoc.toJSON()), 'EX', 60 * 60 * 24);
}

module.exports = { getUserWithToken, setUserCache };
