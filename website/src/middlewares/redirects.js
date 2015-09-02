var nconf = require('nconf');
var IS_PROD = nconf.get('NODE_ENV') === 'production';
var ignoreRedirect = nconf.get('IGNORE_REDIRECT');
var BASE_URL = nconf.get("BASE_URL");

function isHTTP(req) {
  return (
    req.headers['x-forwarded-proto']              &&
    req.headers['x-forwarded-proto'] !== 'https'  &&
    IS_PROD                                       &&
    BASE_URL.indexOf('https') === 0
  );
}

function isProxied(req) {
  return (
    req.headers['x-habitica-lb'] &&
    req.headers['x-habitica-lb'] === 'Yes'
  );
}

module.exports.forceSSL = function(req, res, next){
  if(isHTTP(req) && !isProxied(req)) {
    return res.redirect(BASE_URL + req.url);
  }

  next();
};

// Redirect to habitica for non-api urls

function nonApiUrl(req) {
  return req.url.search(/\/api\//) === -1;
}

module.exports.forceHabitica = function(req, res, next) {
  if (IS_PROD && !ignoreRedirect && !isProxied(req) && nonApiUrl(req)) {
    return res.redirect(301, BASE_URL + req.url);
  }
  next();
};
