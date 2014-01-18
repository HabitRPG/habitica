require('coffee-script') // remove this once we've fully converted over

var express = require("express");
var http = require("http");
var path = require("path");
var optimist = require('optimist');
var app = express();
var nconf = require('nconf');
var utils = require('./utils');
var cron = require('./scripts/cron');
var middleware = require('./middleware');
var domainMiddleware = require('domain-middleware');
var swagger = require("swagger-node-express");
var moment = require("moment");
var server;
var TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;

// ------------ Setup configurations ------------
utils.setupConfig();

// ------------  MongoDB Configuration ------------
mongoose = require('mongoose');
require('./models/user'); //load up the user schema - TODO is this necessary?
require('./models/group');
require('./models/challenge');
mongoose.connect(nconf.get('NODE_DB_URI'), {auto_reconnect:true}, function(err) {
    if (err) throw err;
    console.info('Connected with Mongoose');
});

// ------------  Run Cron Script -------------------
var argv = optimist
        .usage('Usage: $0 [--cron]')
        .boolean('cron')
        .describe('cron', 'Runs the cron script and then exits.')
        .describe('cron-hour', 'Run cron for a set hour in this timezone. Defaults to current hour.')
        .check(function(argv) {
            var hour = argv['cron-hour'];
            if (hour == undefined) return true;
            else return (hour >= 0 && hour < 24);
        })
        .argv;

if (argv.cron) {
    cron.runCron({currentHour: argv['cron-hour']}, function(err, results) {
        if (err) {
            console.log("There were errors while running cron!");
            console.log(err);
        }
        console.log("Cron completed at " + moment().format());
        console.log("Processed cron for " + results.length + " user(s).");
        process.exit();
    });
} else {

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
    app.set("port", nconf.get('PORT'));

    if (!process.env.SUPPRESS) app.use(express.logger("dev"));
    app.use(express.compress());
    app.set("views", __dirname + "/../views");
    app.set("view engine", "jade");
    app.use(express.favicon());
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

    var maxAge = (nconf.get('NODE_ENV') === 'production') ? 31536000000 : 0;
    app.use(express['static'](path.join(__dirname, "/../build"), { maxAge: maxAge }));
    app.use(express['static'](path.join(__dirname, "/../public")));

    // development only
    //if ("development" === app.get("env")) {
    //  app.use(express.errorHandler());
    //}

    // Custom Directives
    app.use(require('./routes/pages').middleware);
    app.use(require('./routes/auth').middleware);
    var v2 = express();
    app.use('/api/v2', v2);
    app.use('/api/v1', require('./routes/apiv1').middleware);
    app.use('/export', require('./routes/dataexport').middleware);

    app.use(utils.errorHandler);

    require('./routes/apiv2.coffee')(swagger, v2);

    server = http.createServer(app).listen(app.get("port"), function() {
        return console.log("Express server listening on port " + app.get("port"));
    });
    app.use(domainMiddleware({
        server: server
        //killTimeout: 30000,
    }));

    module.exports = server;
}
