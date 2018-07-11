import {
  NotFound,
} from '../libs/errors';
import { serveClient } from '../libs/client';

// Serve the client side unless the route starts with one of these strings
// in which case, respond with a 404 error.
const TOP_LEVEL_ROUTES = [
  '/api',
  '/amazon',
  '/iap',
  '/paypal',
  '/stripe',
  '/export',
  '/email',
  '/qr-code',
  // logout, old-client and /static/user/auth/local/reset-password-set-new-one don't need the not found
  // handler because they don't have any child route
];

module.exports = function NotFoundMiddleware (req, res, next) {
  const reqUrl = req.originalUrl;

  const isExistingRoute = TOP_LEVEL_ROUTES.find(routeRoot => {
    if (reqUrl.lastIndexOf(routeRoot, 0) === 0) return true; // starts with
    return false;
  });

  if (isExistingRoute || req.method !== 'GET') {
    return next(new NotFound());
  } else {
    serveClient(res);
  }
};
