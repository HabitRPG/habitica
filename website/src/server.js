if (process.env.NODE_ENV !== 'production') {
  require('babel-register');
}
// Only do the minimal amount of work before forking just in case of a dyno restart
var cluster = require("cluster");
var _ = require('lodash');
var nconf = require('nconf');
var utils = require('./libs/utils');
utils.setupConfig();
var logging = require('./libs/logging');
var isProd = nconf.get('NODE_ENV') === 'production';
var isDev = nconf.get('NODE_ENV') === 'development';
var DISABLE_LOGGING = nconf.get('DISABLE_REQUEST_LOGGING');
var cores = +nconf.get("WEB_CONCURRENCY") || 0;
var moment = require('moment');

if (cores!==0 && cluster.isMaster && (isDev || isProd)) {
  // Fork workers. If config.json has CORES=x, use that - otherwise, use all cpus-1 (production)
  _.times(cores, function () {
    cluster.fork();
  });

  cluster.on('disconnect', function(worker, code, signal) {
    var w = cluster.fork(); // replace the dead worker
    logging.info('[%s] [master:%s] worker:%s disconnect! new worker:%s fork', new Date(), process.pid, worker.process.pid, w.process.pid);
  });

} else {
  var express = require("express");
  var bodyParser = require('body-parser');
  var session = require('cookie-session');
  var logger = require('morgan');
  var compression = require('compression');
  var favicon = require('serve-favicon');

  var BODY_PARSER_LIMIT = '1mb';

  var http = require("http");
  var path = require("path");
  var swagger = require("swagger-node-express");
  var shared = require('../../common');

  // Setup translations
  var i18n = require('./libs/i18n');

  var TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;
  var app = express();
  var server = http.createServer();

  // ------------  MongoDB Configuration ------------
  var mongoose = require('mongoose');
  var mongooseOptions = !isProd ? {} : {
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
  };
  var db = mongoose.connect(nconf.get('NODE_DB_URI'), mongooseOptions, function(err) {
    if (err) throw err;
    logging.info('Connected with Mongoose');
  });

  require('./libs/firebase');

  // load schemas & models
  require('./models/challenge');
  require('./models/group');
  require('./models/user');

  // ------------  Passport Configuration ------------
  var passport = require('passport')
  var util = require('util')
  var FacebookStrategy = require('passport-facebook').Strategy;
  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.  However, since this example does not
  //   have a database of user records, the complete Facebook profile is serialized
  //   and deserialized.
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  // FIXME
  // This auth strategy is no longer used. It's just kept around for auth.js#loginFacebook() (passport._strategies.facebook.userProfile)
  // The proper fix would be to move to a general OAuth module simply to verify accessTokens
  passport.use(new FacebookStrategy({
    clientID: nconf.get("FACEBOOK_KEY"),
    clientSecret: nconf.get("FACEBOOK_SECRET"),
    //callbackURL: nconf.get("BASE_URL") + "/auth/facebook/callback"
  },
    function(accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
   ));

  // ------------  Server Configuration ------------
  var publicDir = path.join(__dirname, "/../public");

  app.set("port", nconf.get('PORT'));

  // Setup two different Express apps, one that matches everything except '/api/v3'
  // and the other for /api/v3 routes, so we can keep the old an new api versions completely separate
  // not sharing a single middleware if we don't want to
  var oldApp = express(); // api v1 and v2, and not scoped routes
  var newApp = express(); // api v3

  // Matches all request except the ones going to /api/v3/**
  app.all(/^(?!\/api\/v3).+/i, oldApp);
  // Matches all requests going to /api/v3
  app.all('/api/v3', newApp);

  require('./middlewares/apiThrottle')(oldApp);
  oldApp.use(require('./middlewares/domain')(server,mongoose));
  if (!isProd && !DISABLE_LOGGING) oldApp.use(logger("dev"));
  oldApp.use(compression());
  oldApp.set("views", __dirname + "/../views");
  oldApp.set("view engine", "jade");
  oldApp.use(favicon(publicDir + '/favicon.ico'));
  oldApp.use(require('./middlewares/cors'));

  var redirects = require('./middlewares/redirects');
  oldApp.use(redirects.forceHabitica);
  oldApp.use(redirects.forceSSL);
  oldApp.use(bodyParser.urlencoded({
    extended: true,
    limit: BODY_PARSER_LIMIT,
  }));
  oldApp.use(bodyParser.json({
    limit: BODY_PARSER_LIMIT,
  }));
  oldApp.use(require('method-override')());
  oldApp.use(session({
    name: 'connect:sess', // Used to keep backward compatibility with Express 3 cookies
    secret: nconf.get('SESSION_SECRET'),
    httpOnly: false,
    maxAge: TWO_WEEKS
  }));

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  oldApp.use(passport.initialize());
  oldApp.use(passport.session());

  var maxAge = isProd ? 31536000000 : 0;
  oldApp.use(express['static'](path.join(__dirname, "/../build"), { maxAge: maxAge }));
  oldApp.use('/common/dist', express['static'](publicDir + "/../../common/dist", { maxAge: maxAge }));
  oldApp.use('/common/audio', express['static'](publicDir + "/../../common/audio", { maxAge: maxAge }));
  oldApp.use('/common/script/public', express['static'](publicDir + "/../../common/script/public", { maxAge: maxAge }));
  oldApp.use('/common/img', express['static'](publicDir + "/../../common/img", { maxAge: maxAge }));
  oldApp.use(express['static'](publicDir));

  // Custom Directives
  oldApp.use('/', require('./routes/pages'));
  oldApp.use('/', require('./routes/payments'));
  oldApp.use('/', require('./routes/api-v2/auth'));
  oldApp.use('/', require('./routes/api-v2/coupon'));
  oldApp.use('/', require('./routes/api-v2/unsubscription'));
  var v2 = express();
  oldApp.use('/api/v2', v2);
  oldApp.use('/api/', require('./routes/api-v1'));
  oldApp.use('/export', require('./routes/dataexport'));
  require('./routes/api-v2/swagger')(swagger, v2);
  oldApp.use(require('./middlewares/errorHandler'));

  server.on('request', app);
  server.listen(app.get("port"), function() {
    return logging.info("Express server listening on port " + app.get("port"));
  });

  module.exports = server;
}
