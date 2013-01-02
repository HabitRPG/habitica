http = require 'http'
path = require 'path'
express = require 'express'
gzippo = require 'gzippo'
derby = require 'derby'
app = require '../app'
serverError = require './serverError'
MongoStore = require('connect-mongo')(express)
auth = require 'derby-auth'
priv = require './private'

## RACER CONFIGURATION ##

racer = require 'racer'
racer.io.set('transports', ['xhr-polling'])
unless process.env.NODE_ENV == 'production'
  racer.use(racer.logPlugin)
  derby.use(derby.logPlugin)

## SERVER CONFIGURATION ##

expressApp = express()
server = http.createServer expressApp
module.exports = server

derby.use(require 'racer-db-mongo')
store = derby.createStore
  db: {type: 'Mongo', uri: process.env.NODE_DB_URI, safe:true}
  listen: server

ONE_YEAR = 1000 * 60 * 60 * 24 * 365
root = path.dirname path.dirname __dirname
publicPath = path.join root, 'public'

habitrpgMiddleware = (req, res, next) ->
  model = req.getModel()
  ## Set _mobileDevice to true or false so view can exclude portions from mobile device
  model.set '_mobileDevice', /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header 'User-Agent')
  model.set '_nodeEnv', process.env.NODE_ENV
  next()

# Authentication setup
strategies =
  facebook:
    strategy: require("passport-facebook").Strategy
    conf:
      clientID: process.env.FACEBOOK_KEY
      clientSecret: process.env.FACEBOOK_SECRET
options =
  domain: (if process.env.NODE_ENV == 'production' then 'https://habitrpg.com' else "http://localhost:3000")
  allowPurl: true
  schema: require('../app/schema').newUserObject()

mongo_store = new MongoStore {url: process.env.NODE_DB_URI}, ->
  expressApp
    .use(express.favicon())
    # Gzip static files and serve from memory
    .use(gzippo.staticGzip publicPath, maxAge: ONE_YEAR)
    # Gzip dynamically rendered content
    .use(express.compress())

    # Uncomment to add form data parsing support
    .use(express.bodyParser())
    .use(express.methodOverride())

    # Uncomment and supply secret to add Derby session handling
    # Derby session middleware creates req.session and socket.io sessions
    .use(express.cookieParser())
    .use(store.sessionMiddleware
      secret: process.env.SESSION_SECRET || 'YOUR SECRET HERE'
      cookie: {maxAge: ONE_YEAR}
      store: mongo_store
    )

    # Adds req.getModel method
    .use(store.modelMiddleware())
    # Middelware can be inserted after the modelMiddleware and before
    # the app router to pass server accessible data to a model
    .use(priv.middleware)
    .use(habitrpgMiddleware)
    .use(auth(store, strategies, options))
    # Creates an express middleware from the app's routes
    .use(app.router())
    .use(expressApp.router)
    .use(serverError root)

  priv.routes(expressApp)
  require('./serverRoutes')(expressApp, root, derby)

  # Errors
  expressApp.all '*', (req) ->
    throw "404: #{req.url}"