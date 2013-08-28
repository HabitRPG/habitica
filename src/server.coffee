express = require("express")
http = require("http")
path = require("path")
app = express()
nconf = require('nconf')
middleware = require("./middleware")
require('./config') # Setup configurations
require('./errors')

###
  MongoDB Configuration
###

mongoose = require('mongoose')
require('./models/user') # load up the user schema - TODO is this necessary?
module.exports = server

# Connect using Mongoose too for API purposes, we'll eventually phase out Derby and only use mongoose
mongoose.connect nconf.get('NODE_DB_URI'), (err) ->
  throw err if (err)
  console.info('Connected with Mongoose')

###
  Server Configuration
###

# all environments
app.set "port", nconf.get('PORT')
app.set "views", __dirname + "/../views"
app.set "view engine", "jade"
app.use express.favicon()
app.use express.logger("dev")
app.use express.bodyParser()
app.use require('connect-assets')()
app.use express.methodOverride()
app.use app.router
app.use express['static'](path.join(__dirname, "/../public"))

# development only
app.use express.errorHandler()  if "development" is app.get("env")

# Custom Directives
app.use(require('./routes/pages').middleware)
app.use('/api/v1', require('./routes/api').middleware)
app.use(require('./controllers/deprecated').middleware)

server = http.createServer(app).listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")
module.exports = server



#ONE_YEAR = 1000 * 60 * 60 * 24 * 365
#TWO_WEEKS = 1000 * 60 * 60 * 24 * 14
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
#  .use(express.bodyParser())
#  .use(express.methodOverride())
#  # Uncomment and supply secret to add Derby session handling
#  # Derby session middleware creates req.session and socket.io sessions
#  .use(express.cookieParser())
#  .use(store.sessionMiddleware
#    secret: process.env.SESSION_SECRET || 'YOUR SECRET HERE'
#    cookie: { maxAge: TWO_WEEKS } # defaults to 2 weeks? aka, can delete this line?
#    store: mongo_store
#  )
#  # Adds req.getModel method
#  .use(store.modelMiddleware())
#  .use(middleware.translate)
#  # API should be hit before all other routes

#  # Show splash page for newcomers
#  .use(middleware.splash)
#  .use(priv.middleware)
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
