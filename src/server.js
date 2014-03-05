// Only do the minimal amount of work before forking just in case of a dyno restart
var cluster = require("cluster");
var _ = require('lodash');
var nconf = require('nconf');
var utils = require('./utils');
utils.setupConfig();
var logging = require('./logging');
var isProd = nconf.get('NODE_ENV') === 'production';
var isDev = nconf.get('NODE_ENV') === 'development';

if (cluster.isMaster && (isDev || isProd)) {
  // Fork workers.
  _.times(_.min([require('os').cpus().length,2]), function(){
    cluster.fork();
  });

  cluster.on('disconnect', function(worker, code, signal) {
    var w = cluster.fork(); // replace the dead worker
    logging.info('[%s] [master:%s] worker:%s disconnect! new worker:%s fork', new Date(), process.pid, worker.process.pid, w.process.pid);
  });

} else {
  require('coffee-script'); // remove this once we've fully converted over
  var express = require("express");
  var http = require("http");
  var path = require("path");
  var swagger = require("swagger-node-express");
  var autoinc = require('mongoose-id-autoinc');

  // Setup translations
  var i18n = require('./i18n');

  var middleware = require('./middleware');

  var TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;
  var app = express();
  var server = http.createServer();

  // ------------  MongoDB Configuration ------------
  mongoose = require('mongoose');
  var mongooseOptions = !isProd ? {} : {
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
  };
  var db = mongoose.connect(nconf.get('NODE_DB_URI'), mongooseOptions, function(err) {
    if (err) throw err;
    logging.info('Connected with Mongoose');
  });
  autoinc.init(db);

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

  // Use the FacebookStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and Facebook
  //   profile), and invoke a callback with a user object.
  passport.use(new FacebookStrategy({
      clientID: nconf.get("FACEBOOK_KEY"),
      clientSecret: nconf.get("FACEBOOK_SECRET"),
      callbackURL: nconf.get("BASE_URL") + "/auth/facebook/callback"
  },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        //process.nextTick(function () {

        // To keep the example simple, the user's Facebook profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Facebook account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
        //});
    }
   ));

  // ------------  Server Configuration ------------
  var publicDir = path.join(__dirname, "/../public");

  app.set("port", nconf.get('PORT'));
  middleware.apiThrottle(app);
  app.use(middleware.domainMiddleware(server,mongoose));
  if (!isProd) app.use(express.logger("dev"));
  app.use(express.compress());
  app.set("views", __dirname + "/../views");
  app.set("view engine", "jade");
  app.use(express.favicon(publicDir + '/favicon.ico'));
  app.use(middleware.cors);
  app.use(middleware.forceSSL);
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
  //app.use(express.cookieParser(nconf.get('SESSION_SECRET')));
  app.use(express.cookieParser());
  app.use(express.cookieSession({ secret: nconf.get('SESSION_SECRET'), httpOnly: false, cookie: { maxAge: TWO_WEEKS }}));
  //app.use(express.session());

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);

  var maxAge = isProd ? 31536000000 : 0;
  // Cache emojis without copying them to build, they are too many
  app.use(express['static'](path.join(__dirname, "/../build"), { maxAge: maxAge }));
  app.use('/bower_components/habitrpg-shared/img/emoji/unicode', express['static'](publicDir + "/bower_components/habitrpg-shared/img/emoji/unicode", { maxAge: maxAge }));
  app.use(express['static'](publicDir));

  // Custom Directives
  app.use(require('./routes/pages').middleware);
  app.use(require('./routes/payments').middleware);
  app.use(require('./routes/auth').middleware);
  app.use(require('./routes/coupon').middleware);
  var v2 = express();
  app.use('/api/v2', v2);
  app.use('/api/v1', require('./routes/apiv1').middleware);
  app.use('/export', require('./routes/dataexport').middleware);
  require('./routes/apiv2.coffee')(swagger, v2);
  app.use(middleware.errorHandler);

  server.on('request', app);
  server.listen(app.get("port"), function() {
    return logging.info("Express server listening on port " + app.get("port"));
  });

  module.exports = server;
}
