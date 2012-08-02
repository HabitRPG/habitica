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
require('./setupStore').accessControl(store)

ONE_YEAR = 1000 * 60 * 60 * 24 * 365
root = path.dirname path.dirname __dirname
publicPath = path.join root, 'public'

customMiddleware = (that) -> 
  return (req, res, next) ->
    # Setup for mobile-device customizations
    model = req.getModel()
    model.set '_mobileDevice', /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(req.header 'User-Agent')
    
    uidParam = req.url.split('/')[1]
    # PURL pseudo-auth: Previously saved session (eg, http://localhost/{guid}) (temporary solution until authentication built)
    acceptableUid = require('Guid').isGuid(uidParam) or (uidParam in ['3','4','9'])
    if acceptableUid and model.session.userId!=uidParam 
      ##FIXME why isn't this working?
      # model.fetch "users.#{uidParam}", (err, user) ->
        # console.log {uidParam:uidParam, split:req.url.split('/'), err:err, user:user}
        # unless user.get('id')
      model.set '_userId', uidParam # set for this request
      model.session.userId = uidParam # and for next requests
    next()
    return that
    
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
  )

  # Adds req.getModel method
  .use(store.modelMiddleware())
  # Middelware can be inserted after the modelMiddleware and before
  # the app router to pass server accessible data to a model
  .use(customMiddleware(this))
  # Creates an express middleware from the app's routes
  .use(app.router())
  .use(expressApp.router)
  .use(serverError root)


## SERVER ONLY ROUTES ##

expressApp.all '*', (req) ->
  throw "404: #{req.url}"

# Would implement cron here, using node-cron & https://github.com/codeparty/derby/issues/99#issuecomment-6596460
# But it's not working
# cronJob = require("cron").CronJob
# model = store.createModel()
# new cronJob("* * * * * *", ->
  # model.get() #TODO this returns {}, can't seem to access the data
# , null, true, "America/Los_Angeles")

