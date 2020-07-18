import nconf from 'nconf';
import {
  Forbidden,
} from '../libs/errors';
import apiError from '../libs/apiError';

// Middleware to block unwanted IP addresses

// NOTE: it's meant to be used behind a proxy (for example a load balancer)
// that uses the 'x-forwarded-for' header to forward the original IP addresses.

// A list of comma separated IPs to block
// It works fine as long as the list is short,
// if the list becomes too long for an env variable we'll switch to Redis.
const BLOCKED_IPS_RAW = nconf.get('BLOCKED_IPS');

const blockedIps = BLOCKED_IPS_RAW
  ? BLOCKED_IPS_RAW
    .trim()
    .split(',')
    .map(blockedIp => blockedIp.trim())
    .filter(blockedIp => Boolean(blockedIp))
  : [];

export default function ipBlocker (req, res, next) {
  // If there are no IPs to block, skip the middleware
  if (blockedIps.length === 0) return next();

  // Is the client IP, req.ip, blocked?
  const match = blockedIps.find(blockedIp => blockedIp === req.ip) !== undefined;

  if (match === true) {
    // Not translated because no user is loaded at this point
    return next(new Forbidden(apiError('ipAddressBlocked')));
  }

  return next();
}
