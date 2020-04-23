import nconf from 'nconf';
import url from 'url';

const IS_PROD = nconf.get('IS_PROD');
const IGNORE_REDIRECT = nconf.get('IGNORE_REDIRECT') === 'true';
const BASE_URL = nconf.get('BASE_URL');
const HTTPS_BASE_URL = BASE_URL.indexOf('https') === 0;

// A secret key that if passed as req.query.skipSSLCheck allows to skip
// the redirects to SSL, used for health checks from the load balancer
const SKIP_SSL_CHECK_KEY = nconf.get('SKIP_SSL_CHECK_KEY');

const BASE_URL_HOST = url.parse(BASE_URL).hostname;

function isHTTP (req) {
  return ( // eslint-disable-line no-extra-parens
    req.protocol === 'http'
    && IS_PROD
    && HTTPS_BASE_URL === true
  );
}

export function forceSSL (req, res, next) {
  const { skipSSLCheck } = req.query;
  if (
    isHTTP(req)
    && (!SKIP_SSL_CHECK_KEY || !skipSSLCheck || skipSSLCheck !== SKIP_SSL_CHECK_KEY)
  ) {
    return res.redirect(BASE_URL + req.originalUrl);
  }

  return next();
}

// Redirect to habitica for non-api urls

function nonApiUrl (req) {
  return req.originalUrl.search(/\/api\//) === -1;
}

export function forceHabitica (req, res, next) {
  if (IS_PROD && !IGNORE_REDIRECT && req.hostname !== BASE_URL_HOST && nonApiUrl(req) && req.method === 'GET') {
    return res.redirect(301, BASE_URL + req.url);
  }

  return next();
}
