http = require 'http'
path = require 'path'
express = require 'express'
gzippo = require 'gzippo'
derby = require 'derby'
app = require '../app'
serverError = require './serverError'
MongoStore = require('connect-mongo')(express)

## RACER CONFIGURATION ##

racer = require 'derby/node_modules/racer'
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
  db: {type: 'Mongo', uri: process.env.NODE_DB_URI}
  listen: server

ONE_YEAR = 1000 * 60 * 60 * 24 * 365
root = path.dirname path.dirname __dirname
publicPath = path.join root, 'public'

habitrpgMiddleware = (req, res, next) ->
  model = req.getModel()
  
  ## PURL authentication
  # Setup userId for new users
  req.session.userId ||= derby.uuid() 
  # Previously saved session (eg, http://localhost/{guid}) (temporary solution until authentication built)
  uidParam = req.url.split('/')[1]
  acceptableUid = require('guid').isGuid(uidParam) or (uidParam in ['3','9'])
  if acceptableUid && req.session.userId!=uidParam
    # TODO test whether user exists: ```model.fetch("users.#{uidParam}", function(err,user){if(user.get(..){})}})```, but doesn't seem to work
    req.session.userId = uidParam
  model.set '_userId', req.session.userId

  ## Set _mobileDevice to true or false so view can exclude portions from mobile device
  model.set '_mobileDevice', /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header 'User-Agent')

  ## Same for production/development
  model.set '_nodeEnv', process.env.NODE_ENV
  
  ## Setup access control
  require('./setupStore').accessControl(store)

  next()
  
expressApp
  .use(express.favicon())
  # Gzip static files and serve from memory
  .use(gzippo.staticGzip publicPath, maxAge: ONE_YEAR)
  # Gzip dynamically rendered content
  .use(express.compress())

  # Uncomment to add form data parsing support
  # .use(express.bodyParser())
  # .use(express.methodOverride())

  # Uncomment and supply secret to add Derby session handling
  # Derby session middleware creates req.session and socket.io sessions
  .use(express.cookieParser())
  .use(store.sessionMiddleware
    secret: process.env.SESSION_SECRET || 'YOUR SECRET HERE'
    cookie: {maxAge: ONE_YEAR}
    store: new MongoStore(db: 'habitrpg')
  )

  # Adds req.getModel method
  .use(store.modelMiddleware())
  # Middelware can be inserted after the modelMiddleware and before
  # the app router to pass server accessible data to a model
  .use(habitrpgMiddleware)
  # Creates an express middleware from the app's routes
  .use(app.router())
  .use(expressApp.router)
  .use(serverError root)


## SERVER ONLY ROUTES ##

expressApp.all '*', (req) ->
  throw "404: #{req.url}"
  