http = require 'http'
path = require 'path'
express = require 'express'
gzippo = require 'gzippo'
derby = require 'derby'
app = require '../app'
serverError = require './serverError'

## RACER CONFIGURATION ##

racer = require 'derby/node_modules/racer'
# racer.use(racer.logPlugin)
racer.set('transports', ['xhr-polling'])
# racer.set('bundle timeout', 10000)

## SERVER CONFIGURATION ##

expressApp = express()
server = http.createServer expressApp
module.exports = server

derby.use(derby.logPlugin)
derby.use(require 'racer-db-mongo')
store = derby.createStore
  db: {type: 'Mongo', uri: process.env.NODE_DB_URI}
  listen: server
# require('./setupStore').accessControl(store)

ONE_YEAR = 1000 * 60 * 60 * 24 * 365
root = path.dirname path.dirname __dirname
publicPath = path.join root, 'public'

habitrpgMobile = (req, res, next) ->
  model = req.getModel()
  model.set '_mobileDevice', /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header 'User-Agent')
  next()
  
# PURL pseudo-auth: Previously saved session (eg, http://localhost/{guid}) (temporary solution until authentication built)
habitrpgSessions = (req, res, next) ->
  uidParam = req.url.split('/')[1]  
  acceptableUid = require('guid').isGuid(uidParam) or (uidParam in ['3','9'])
  if acceptableUid# and req.session.userId!=uidParam 
    # model.fetch "users.#{uidParam}", (err, user) -> #test whether user exists
      # if user.get('id')
    req.session ||= {}
    req.session.userId = uidParam
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
  .use(habitrpgSessions)  
  .use(store.sessionMiddleware
    secret: process.env.SESSION_SECRET || 'YOUR SECRET HERE'
    cookie: {maxAge: ONE_YEAR}
  )

  # Adds req.getModel method
  .use(store.modelMiddleware())
  # Middelware can be inserted after the modelMiddleware and before
  # the app router to pass server accessible data to a model
  .use(habitrpgMobile)
  # Creates an express middleware from the app's routes
  .use(app.router())
  .use(expressApp.router)
  .use(serverError root)


## SERVER ONLY ROUTES ##

expressApp.all '*', (req) ->
  throw "404: #{req.url}"
  