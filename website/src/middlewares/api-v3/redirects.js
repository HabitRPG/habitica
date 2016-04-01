import nconf from 'nconf';

const IS_PROD = nconf.get('IS_PROD');
const IGNORE_REDIRECT = nconf.get('IGNORE_REDIRECT');
const BASE_URL = nconf.get('BASE_URL');

function isHTTP (req) {
  return ( // eslint-disable-line no-extra-parens
    req.header('x-forwarded-proto') &&
    req.header('x-forwarded-proto') !== 'https' &&
    IS_PROD &&
    BASE_URL.indexOf('https') === 0
  );
}

function isProxied (req) {
  return ( // eslint-disable-line no-extra-parens
    req.header('x-habitica-lb') &&
    req.header('x-habitica-lb') === 'Yes'
  );
}

export function forceSSL (req, res, next) {
  if (isHTTP(req) && !isProxied(req)) {
    return res.redirect(BASE_URL + req.originalUrl);
  }

  next();
}

// Redirect to habitica for non-api urls

function nonApiUrl (req) {
  return req.originalUrl.search(/\/api\//) === -1;
}

export function forceHabitica (req, res, next) {
  if (IS_PROD && !IGNORE_REDIRECT && !isProxied(req) && nonApiUrl(req)) {
    return res.redirect(301, BASE_URL + req.url);
  }

  next();
}
