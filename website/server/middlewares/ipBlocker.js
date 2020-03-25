import nconf from 'nconf';
import {
  NotAuthorized,
} from '../libs/errors';

// A list of comma separated IPs to block
// It works fine as long as the list is short,
// if the list becomes too long for an env variable we'll switch to Redis.
const BLOCKED_IPS_RAW = nconf.get('BLOCKED_IPS');

const blockedIps = BLOCKED_IPS_RAW
  .split(',')
  .map(blockedIp => blockedIp.trim());

export default function ipBlocker (req, res, next) {
  // If there are no IPs to block, skip the middleware
  if (blockedIps.length === 0) return next();

  // If x-forwarded-for is undefined we're not behind the prod proxy
  // TODO necessary?
  const originIpsRaw = req.header('x-forwarded-for');
  if (!originIpsRaw) return next();

  // Format xxx.xxx.xxx.xxx, xxx.xxx.xxx.xxx (comma separated ip)
  const originIps = originIpsRaw
    .split(',')
    .map(originIp => originIp.trim());

  // The last ip in the list is made by GCP load balancer
  // See https://cloud.google.com/load-balancing/docs/https#target-proxies
  // In particular:
  // << A Google Cloud external HTTP(S) load balancer adds two IP addresses to the header:
  // the IP address of the requesting client and the external IP address of the load balancer's
  // forwarding rule, in that order.
  // Therefore, the IP address that immediately precedes the Google Cloud load balancer's
  // IP address is the IP address of the system that contacts the load balancer.
  // The system might be a client, or it might be another proxy server, outside Google Cloud,
  // that forwards requests on behalf of a client. >>
  //
  // So the IP to be check is the penultimate in the list
  const targetIp = originIps[originIps.length - 2];
  if (!targetIp) return next();

  if (blockedIps.includes(targetIp)) {
    // Not translated because no user is loaded at this point
    throw new NotAuthorized('This ip is blocked.');
  }

  return next();
}
