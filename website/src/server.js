// TODO cleanup all comments when finished API v3

import nconf from 'nconf';
import logging from './libs/api-v2/logging';
import utils from './libs/utils';
import express from 'express';
import http from 'http';
// import path from 'path';
// let swagger = require('swagger-node-express');
import autoinc from 'mongoose-id-autoinc';
import passport from 'passport';
// let shared = require('../../common');
import passportFacebook from 'passport-facebook';
import mongoose from 'mongoose';
import Q from 'q';
import attachMiddlewares from './middlewares/api-v3/index';
utils.setupConfig();

// Setup translations
// let i18n = require('./libs/i18n');

const IS_PROD = nconf.get('IS_PROD');
// const IS_DEV = nconf.get('IS_DEV');
// const DISABLE_LOGGING = nconf.get('DISABLE_REQUEST_LOGGING');
// const TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;

let server = http.createServer();
let app = express();

// Mongoose configuration

// Use Q promises instead of mpromise in mongoose
mongoose.Promise = Q;
let mongooseOptions = !IS_PROD ? {} : {
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
};
let db = mongoose.connect(nconf.get('NODE_DB_URI'), mongooseOptions, (err) => {
  if (err) throw err;
  logging.info('Connected with Mongoose');
});

autoinc.init(db);

import './libs/firebase';

// load schemas & models
import './models/challenge';
import './models/group';
import './models/user';

// ------------  Passport Configuration ------------
// let util = require('util')
let FacebookStrategy = passportFacebook.Strategy;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((obj, done) => done(null, obj));

// FIXME
// This auth strategy is no longer used. It's just kept around for auth.js#loginFacebook() (passport._strategies.facebook.userProfile)
// The proper fix would be to move to a general OAuth module simply to verify accessTokens
passport.use(new FacebookStrategy({
  clientID: nconf.get('FACEBOOK_KEY'),
  clientSecret: nconf.get('FACEBOOK_SECRET'),
  // callbackURL: nconf.get("BASE_URL") + "/auth/facebook/callback"
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

// ------------  Server Configuration ------------
// let publicDir = path.join(__dirname, '/../public');

app.set('port', nconf.get('PORT'));

// Setup two different Express apps, one that matches everything except '/api/v3'
// and the other for /api/v3 routes, so we can keep the old an new api versions completely separate
// not sharing a single middleware if we don't want to
let oldApp = express(); // api v1 and v2, and not scoped routes
let newApp = express(); // api v3

// Route requests to the right app
// Matches all request except the ones going to /api/v3/**
app.all(/^(?!\/api\/v3).+/i, oldApp);
// Matches all requests going to /api/v3
app.all('/api/v3', newApp);

// Mount middlewares for the new app
attachMiddlewares(newApp);

/* OLD APP IS DISABLED UNTIL COMPATIBLE WITH NEW MODELS
//require('./middlewares/apiThrottle')(oldApp);
oldApp.use(require('./middlewares/domain')(server,mongoose));
if (!IS_PROD && !DISABLE_LOGGING) oldApp.use(require('morgan')("dev"));
oldApp.use(require('compression')());
oldApp.set("views", __dirname + "/../views");
oldApp.set("view engine", "jade");
oldApp.use(require('serve-favicon')(publicDir + '/favicon.ico'));
oldApp.use(require('./middlewares/cors'));

var redirects = require('./middlewares/redirects');
oldApp.use(redirects.forceHabitica);
oldApp.use(redirects.forceSSL);
var bodyParser = require('body-parser');
// Default limit is 100kb, need that because we actually send whole groups to the server
// FIXME as soon as possible (need to move on the client from $resource -> $http)
oldApp.use(bodyParser.urlencoded({
  limit: '1mb',
  parameterLimit: 10000, // Upped for safety from 1k, FIXME as above
  extended: true // Uses 'qs' library as old connect middleware
}));
oldApp.use(bodyParser.json({
  limit: '1mb'
}));
oldApp.use(require('method-override')());

oldApp.use(require('cookie-parser')());
oldApp.use(require('cookie-session')({
  name: 'connect:sess', // Used to keep backward compatibility with Express 3 cookies
  secret: nconf.get('SESSION_SECRET'),
  httpOnly: false,
  maxAge: TWO_WEEKS
}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
oldApp.use(passport.initialize());
oldApp.use(passport.session());

// Custom Directives
oldApp.use(require('./routes/pages'));
oldApp.use(require('./routes/payments'));
oldApp.use(require('./routes/api-v2/auth'));
oldApp.use(require('./routes/api-v2/coupon'));
oldApp.use(require('./routes/api-v2/unsubscription'));
var v2 = express();
oldApp.use('/api/v2', v2);
oldApp.use('/api/v1', require('./routes/api-v1'));
oldApp.use('/export', require('./routes/dataexport'));
require('./routes/api-v2/swagger')(swagger, v2);

var maxAge = IS_PROD ? 31536000000 : 0;
// Cache emojis without copying them to build, they are too many
oldApp.use(express['static'](path.join(__dirname, "/../build"), { maxAge: maxAge }));
oldApp.use('/common/dist', express['static'](publicDir + "/../../common/dist", { maxAge: maxAge }));
oldApp.use('/common/audio', express['static'](publicDir + "/../../common/audio", { maxAge: maxAge }));
oldApp.use('/common/script/public', express['static'](publicDir + "/../../common/script/public", { maxAge: maxAge }));
oldApp.use('/common/img', express['static'](publicDir + "/../../common/img", { maxAge: maxAge }));
oldApp.use(express['static'](publicDir));

oldApp.use(require('./middlewares/errorHandler'));
*/

server.on('request', app);
server.listen(app.get('port'), () => {
  return logging.info(`Express server listening on port ${app.get('port')}`);
});

export default server;
