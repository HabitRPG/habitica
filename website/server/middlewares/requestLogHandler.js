import { v4 as uuid } from 'uuid';
import logger from '../libs/logger';

export const logRequestEnd = (req, res) => {
  const now = Date.now();
  const requestTime = now - req.requestStartTime;
  logger.info('Request completed', {
    requestId: req.requestIdentifier,
    method: req.method,
    url: req.originalUrl,
    duration: requestTime,
    endTime: now,
    statusCode: res.statusCode,
  });
};

export const logRequestData = (req, res, next) => {
  req.requestStartTime = Date.now();
  req.requestIdentifier = uuid();
  logger.info('Request started', {
    requestId: req.requestIdentifier,
    method: req.method,
    url: req.originalUrl,
    startTime: req.requestStartTime,
  });
  req.on('close', () => {
    logRequestEnd(req, res);
  });
  next();
};
