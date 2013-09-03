var nconf = require('nconf');
var _ = require('lodash');

module.exports.splash = function(req, res, next) {
  if (req.url == '/' && !req.headers['x-api-user'] && !req.headers['x-api-key'] && !(req.session && req.session.userId))
    return res.redirect('/static/front')
  next()
};

module.exports.cors = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,HEAD,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Accept,Content-Encoding,X-Requested-With,x-api-user,x-api-key");
  if (req.method === 'OPTIONS') return res.send(200);
  return next();
};

module.exports.locals = function(req, res, next) {
  res.locals.habitrpg  = res.locals.habitrpg || {}
  _.defaults(res.locals.habitrpg, {
    NODE_ENV: req.url.split('/')[1] == 'static' ? 'production' : nconf.get('NODE_ENV'), // Don't show debugging options on static pages
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header('User-Agent')),
    STRIPE_PUB_KEY: nconf.get('STRIPE_PUB_KEY')
  });
  next()
}
/*
 //  translate = (req, res, next) ->
 //    model = req.getModel()
 //    # Set locale to bg on dev
 //    #model.set '_i18n.locale', 'bg' if process.env.NODE_ENV is "development"
 //    next()
 */