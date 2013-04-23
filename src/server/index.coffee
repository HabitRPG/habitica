http = require 'http'
path = require 'path'
express = require 'express'
gzippo = require 'gzippo'
derby = require 'derby'
racer = require 'racer'
auth = require 'derby-auth'
app = require '../app'
serverError = require './serverError'
MongoStore = require('connect-mongo')(express)
priv = require './private'
habitrpgStore = require './store'
middleware = require './middleware'

## RACER CONFIGURATION ##

#racer.io.set('transports', ['xhr-polling'])
racer.ioClient.set('reconnection limit', 300000) # max reconect timeout to 5 minutes
racer.set('bundleTimeout', 40000)
#unless process.env.NODE_ENV == 'production'
#  racer.use(racer.logPlugin)
#  derby.use(derby.logPlugin)

# Infinite stack trace
Error.stackTraceLimit = Infinity if process.env.NODE_ENV is 'development'

## SERVER CONFIGURATION ##

expressApp = express()
server = http.createServer expressApp
module.exports = server

derby.use require('racer-db-mongo')
module.exports.habitStore = store = derby.createStore
  db: {type: 'Mongo', uri: process.env.NODE_DB_URI, safe:true}
  listen: server

ONE_YEAR = 1000 * 60 * 60 * 24 * 365
TWO_WEEKS = 1000 * 60 * 60 * 24 * 14
root = path.dirname path.dirname __dirname
publicPath = path.join root, 'public'

# Authentication setup
strategies =
  facebook:
    strategy: require("passport-facebook").Strategy
    conf:
      clientID: process.env.FACEBOOK_KEY
      clientSecret: process.env.FACEBOOK_SECRET
options =
  domain: process.env.BASE_URL || 'http://localhost:3000'
  allowPurl: true
  schema: require('../app/character').newUserObject()

# This has to happen before our middleware stuff
auth.store(store, habitrpgStore.customAccessControl)

mongo_store = new MongoStore {url: process.env.NODE_DB_URI}, ->
  expressApp.configure 'development', ->
    # Gzip static files and serve from memory
    expressApp.use(gzippo.staticGzip(publicPath, maxAge: ONE_YEAR))

  expressApp
    .use(middleware.allowCrossDomain)
    .use(express.favicon("#{publicPath}/favicon.ico"))
    # Gzip dynamically rendered content
    .use(express.compress())
    .use(express.bodyParser())
    .use(express.methodOverride())
    # Uncomment and supply secret to add Derby session handling
    # Derby session middleware creates req.session and socket.io sessions
    .use(express.cookieParser())
    .use(store.sessionMiddleware
      secret: process.env.SESSION_SECRET || 'YOUR SECRET HERE'
      cookie: { maxAge: TWO_WEEKS } # defaults to 2 weeks? aka, can delete this line?
      store: mongo_store
    )
    # Adds req.getModel method
    .use(store.modelMiddleware())
    # API should be hit before all other routes
    .use('/api/v1', middleware.httpsApi)
    .use('/api/v1', require('./api').middleware)
    .use(require('./deprecated').middleware)
    # Show splash page for newcomers
    .use(middleware.splash)
    .use(priv.middleware)
    .use(middleware.view)
    .use(auth.middleware(strategies, options))
    # Creates an express middleware from the app's routes
    .use(app.router())
    .use(require('./static').middleware)
    .use(expressApp.router)
    .use(serverError(root))

  priv.routes(expressApp)


  # Errors
  expressApp.all '*', (req) ->
    throw "404: #{req.url}"
