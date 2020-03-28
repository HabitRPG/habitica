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

  // If x-forwarded-for is undefined we're not behind the production proxy
  const originIpsRaw = req.header('x-forwarded-for');
  if (!originIpsRaw) return next();

  // Format xxx.xxx.xxx.xxx, xxx.xxx.xxx.xxx (comma separated list of ip)
  const originIps = originIpsRaw
    .split(',')
    .map(originIp => originIp.trim());

  // We try to match any of the origins IPs against the blocked IPs list.
  //
  // In case we're behind a Google Cloud Load Balancer the last ip
  // in the list is added by the load balancer.
  // See https://cloud.google.com/load-balancing/docs/https#target-proxies
  // In particular:
  // << A Google Cloud external HTTP(S) load balancer adds two IP addresses to the header:
  // the IP address of the requesting client and the external IP address of the load balancer's
  // forwarding rule, in that order.
  // Therefore, the IP address that immediately precedes the Google Cloud load balancer's
  // IP address is the IP address of the system that contacts the load balancer.
  // The system might be a client, or it might be another proxy server, outside Google Cloud,
  // that forwards requests on behalf of a client. >>

  const match = originIps.find(originIp => blockedIps.includes(originIp)) !== undefined;

  if (match === true) {
    // Not translated because no user is loaded at this point
    return next(new Forbidden(apiError('ipAddressBlocked')));
  }

  return next();
}
