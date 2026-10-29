import {
  Forbidden,
} from '../libs/errors';
import { apiError } from '../libs/apiError';
import { isIpBlocked, isClientBlocked } from '../libs/blockers';

// Middleware to block unwanted IP addresses and clients

// NOTE: it's meant to be used behind a proxy (for example a load balancer)
// that uses the 'x-forwarded-for' header to forward the original IP addresses.

export default function ipBlocker (req, res, next) {
  if (isIpBlocked(req.ip)) {
    const error = new Forbidden(apiError('ipAddressBlocked'));
    error.skipLogging = true;
    return next(error);
  }

  if (isClientBlocked(req.headers['x-client'])) {
    const error = new Forbidden(apiError('clientBlocked'));
    error.skipLogging = true;
    return next(error);
  }

  return next();
}
