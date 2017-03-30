import nconf from 'nconf';

const IS_PROD = nconf.get('IS_PROD');
const IGNORE_REDIRECT = nconf.get('IGNORE_REDIRECT') === 'true';
const BASE_URL = nconf.get('BASE_URL');

let baseUrlSplit = BASE_URL.split('//');
const BASE_URL_HOST = baseUrlSplit[1];

function isHTTP (req) {
  return ( // eslint-disable-line no-extra-parens
    req.header('x-forwarded-proto') &&
    req.header('x-forwarded-proto') !== 'https' &&
    IS_PROD &&
    BASE_URL.indexOf('https') === 0
  );
}

export function forceSSL (req, res, next) {
  if (isHTTP(req)) {
    return res.redirect(BASE_URL + req.originalUrl);
  }

  next();
}

// Redirect to habitica for non-api urls

function nonApiUrl (req) {
  return req.originalUrl.search(/\/api\//) === -1;
}

export function forceHabitica (req, res, next) {
  if (IS_PROD && !IGNORE_REDIRECT && req.hostname !== BASE_URL_HOST && nonApiUrl(req) && req.method === 'GET') {
    return res.redirect(301, BASE_URL + req.url);
  }

  next();
}
