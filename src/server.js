require('coffee-script') // remove this once we've fully converted over

var express = require("express");
var http = require("http");
var path = require("path");
var app = express();
var nconf = require('nconf');
var middleware = require('./middleware');
var server;
var TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;

// Setup configurations
require('./config');
require('./errors');

// MongoDB Configuration
mongoose = require('mongoose');
require('./models/user'); //load up the user schema - TODO is this necessary?
require('./models/group');
mongoose.connect(nconf.get('NODE_DB_URI'), function(err) {
  if (err) throw err;
  console.info('Connected with Mongoose');
});

/**
 Server Configuration
 */


// all environments
app.set("port", nconf.get('PORT'));
app.set("views", __dirname + "/../views");
app.set("view engine", "jade");
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(middleware.cors);
app.use(express.bodyParser());
app.use(require('connect-assets')());
app.use(express.methodOverride());
//app.use(express.cookieParser(nconf.get('SESSION_SECRET')));
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: nconf.get('SESSION_SECRET'), httpOnly: false, cookie: { maxAge: TWO_WEEKS }}));
//app.use(express.session());
app.use(middleware.splash);
app.use(middleware.locals);
app.use(app.router);
app.use(express['static'](path.join(__dirname, "/../public")));

// development only
if ("development" === app.get("env")) {
  app.use(express.errorHandler());
}

// Custom Directives
app.use(require('./routes/pages').middleware);
app.use('/api/v1', require('./routes/api').middleware);
app.use(require('./controllers/deprecated').middleware);
server = http.createServer(app).listen(app.get("port"), function() {
  return console.log("Express server listening on port " + app.get("port"));
});

module.exports = server;

/*
 #ONE_YEAR = 1000 * 60 * 60 * 24 * 365
 #root = path.dirname path.dirname __dirname
 #publicPath = path.join root, 'public'
 #
 #
 #expressApp
 #  .use(middleware.allowCrossDomain)
 #  .use(express.favicon("#{publicPath}/favicon.ico"))
 #  # Gzip static files and serve from memory
 #  .use(gzippo.staticGzip(publicPath, maxAge: ONE_YEAR))
 #  # Gzip dynamically rendered content
 #  .use(express.compress())
 #  .use(middleware.translate)
 #  .use(middleware.view)
 #  .use(auth.middleware(strategies, options))
 #  # Creates an express middleware from the app's routes
 #  .use(app.router())
 #  .use(require('./static').middleware)
 #  .use(expressApp.router)
 #  .use(serverError(root))
 #
 #
 ## Errors
 #expressApp.all '*', (req) ->
 #  throw "404: #{req.url}"
 */

