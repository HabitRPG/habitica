http = require 'http'
path = require 'path'
express = require 'express'
gzippo = require 'gzippo'
MongoStore = require('connect-mongo')(express)
derby = require 'derby'
app = require '../app'
serverError = require './serverError'


## SERVER CONFIGURATION ##

ONE_YEAR = 1000 * 60 * 60 * 24 * 365
root = path.dirname path.dirname __dirname
publicPath = path.join root, 'public'

(expressApp = express())
  .use(express.favicon())
  # Gzip static files and serve from memory
  .use(gzippo.staticGzip publicPath, maxAge: ONE_YEAR)

  # Gzip dynamically rendered content
  .use(express.compress())

  # Uncomment to add form data parsing support
  # .use(express.bodyParser())
  # .use(express.methodOverride())

  # Derby session middleware creates req.model and subscribes to _session
  .use(express.cookieParser 'secret_sauce')
  .use(express.session
    secret: 'secret_sauce'
    cookie: {maxAge: ONE_YEAR}
    store: new MongoStore(db: 'habitrpg', collection: 'express-sessions')
  )
  .use(app.session())

  # The router method creates an express middleware from the app's routes
  .use(app.router())
  .use(expressApp.router)
  .use(serverError root)

exports = module.exports = server = http.createServer expressApp


## SERVER ONLY ROUTES ##

expressApp.all '*', (req) ->
  throw "404: #{req.url}"


## STORE SETUP ##

derby.use(require 'racer-db-mongo')

exports.store = app.createStore
  listen: server
  db: {type: 'Mongo', uri: 'mongodb://localhost/habitrpg'}

# Would implement cron here, using node-cron & https://github.com/codeparty/derby/issues/99#issuecomment-6596460
# But it's not working
# cronJob = require("cron").CronJob
# model = store.createModel()
# new cronJob("* * * * * *", ->
  # model.get() #TODO this returns {}, can't seem to access the data
# , null, true, "America/Los_Angeles")

