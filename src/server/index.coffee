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
habitrpgStore = require('./store')

## RACER CONFIGURATION ##

racer = require 'racer'
racer.io.set('transports', ['xhr-polling'])
racer.ioClient.set('reconnection limit', 300000) # max reconect timeout to 5 minutes
racer.set('bundleTimeout', 40000)
#unless process.env.NODE_ENV == 'production'
#  racer.use(racer.logPlugin)
#  derby.use(derby.logPlugin)

## SERVER CONFIGURATION ##

expressApp = express()
server = http.createServer expressApp
module.exports = server

derby.use(require 'racer-db-mongo')
store = derby.createStore
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
  expressApp
    #.use (req, res, next) ->
    #  if toobusy()
    #    return res.redirect 307, '/500.html'
    #  else
    #    next()

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
      cookie: {maxAge: TWO_WEEKS} # defaults to 2 weeks? aka, can delete this line?
      store: mongo_store
    )

    #show splash page for newcomers
    .use (req, res, next) ->
      # This was an API call, not a page load
      return next() if req.is('json')

      if !req.session.userId? and !req.query?.play? and req.url == '/'
        return res.redirect('/splash.html')
      else
        next()

    # Adds req.getModel method
    .use(store.modelMiddleware())
    # Middelware can be inserted after the modelMiddleware and before
    # the app router to pass server accessible data to a model
    .use(priv.middleware)

    # HabitRPG Custom Middleware
    .use (req, res, next) ->
      model = req.getModel()
      _view = model.get('_view') || {}
      ## Set _mobileDevice to true or false so view can exclude portions from mobile device
      _view.mobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header 'User-Agent')
      _view.nodeEnv = process.env.NODE_ENV
      model.set '_view', _view
      next()

    .use(auth.middleware(strategies, options))
    # Creates an express middleware from the app's routes
    .use(app.router())
    .use('/v1', require('./api').middleware)
    .use(require('./static').middleware)
    .use(require('./deprecated').middleware)
    .use(expressApp.router)
    .use(serverError root)

  priv.routes(expressApp)

  # Errors
  expressApp.all '*', (req) ->
    throw "404: #{req.url}"