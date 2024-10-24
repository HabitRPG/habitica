import { v4 as uuid } from 'uuid';
import omit from 'lodash/omit';
import logger from '../libs/logger';

function buildBaseLogData (req) {
  return {
    requestId: req.requestIdentifier,
    method: req.method,
    url: req.originalUrl,

    headers: omit(req.headers, ['x-api-key', 'cookie', 'password', 'confirmPassword']),
    body: omit(req.body, ['password', 'confirmPassword']),
    query: omit(req.query, ['password', 'confirmPassword']),
  };
}

export const logRequestEnd = (req, res) => {
  const now = Date.now();
  const requestTime = now - req.requestStartTime;
  const data = buildBaseLogData(req);
  data.duration = requestTime;
  data.endTime = now;
  data.statusCode = res.statusCode;
  logger.info('Request completed', data);
};

export const logRequestData = (req, res, next) => {
  req.requestStartTime = Date.now();
  req.requestIdentifier = uuid();
  const data = buildBaseLogData(req);
  data.startTime = req.requestStartTime;
  logger.info('Request started', data);
  req.on('close', () => {
    logRequestEnd(req, res);
  });
  next();
};
