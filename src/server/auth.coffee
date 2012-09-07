conf = require("./conf")
derby = require('derby')

# FIXME I need access to model in everyauth, so that I can test whether a user exists in the database or 
# create a new one otherwise. Everyauth configs must be declared before expressApp.use(...); howeve,r model is 
# setup during expresApp.use(...). So my hack is - declare model here, define everyauth configs early in the server (like
# we should), then use our own middleware (habitrpgMiddleware) to model during expresApp.use(...)
model = undefined
sess = undefined

# Ultimate goal: set `sess.auth.userId`

## PURL authentication
# This is temporary and will go away when everyauth is setup. It tests to see if
# a UUID was used (bookmarked private url), and restores the user session if so
module.exports.setupPurlAuth = (req) ->
  model = req.getModel()
  sess = req.session
  
  # Setup userId for new users
  sess.userId ||= derby.uuid()
  sess.auth ||= {userId: sess.userId} # prepare for everyauth  
  # Previously saved session (eg, http://localhost/{guid}) (temporary solution until authentication built)
  uidParam = req.url.split('/')[1]
  acceptableUid = require('guid').isGuid(uidParam) or (uidParam in ['3','9'])
  if acceptableUid && sess.userId!=uidParam
    # TODO test whether user exists: ```model.fetch("users.#{uidParam}", function(err,user){if(user.get(..){})}})```, but doesn't seem to work
    sess.userId = uidParam
  model.set '_userId', sess.userId

## Setup callbacks for serializing/deserializing users to/from model.
module.exports.setupEveryauth = (everyauth) ->
  
  everyauth.debug = true
  
  everyauth.everymodule.findUserById (id, callback) ->
    model.fetch "users.#{id}", (err, user) ->
      if user && user.get('id')
        callback null, user.get() # FIXME what format are we supposed to return user?
      else 
        # Create new user if none exists
        # deep clone, else further new users get duplicate objects
        schema = require('../app/schema')
        content = require('../app/content')
        newUser = require('node.extend')(true, {}, schema.userSchema)
        for task in content.defaultTasks
          guid = task.id = require('derby/node_modules/racer').uuid()
          newUser.tasks[guid] = task
          switch task.type
            when 'habit' then newUser.habitIds.push guid 
            when 'daily' then newUser.dailyIds.push guid 
            when 'todo' then newUser.todoIds.push guid 
            when 'reward' then newUser.rewardIds.push guid 
        model.set "users.#{id}", newUser
        callback null, newUser
  
  # Facebook Authentication Logic 
  everyauth
    .facebook
    .appId(process.env.FACEBOOK_KEY)
    .appSecret(process.env.FACEBOOK_SECRET)
    .findOrCreateUser( (session, accessToken, accessTokenExtra, fbUserMetadata) ->
      # usersByFbId[fbUserMetadata.id] or (usersByFbId[fbUserMetadata.id] = addUser("facebook", fbUserMetadata))
      q = model.query('users').withEveryauth('facebook', fbUserMetadata.id)
      model.fetch q, (err,user) ->
        console.log {err:err,user:user} #FIXME this is always returning user:null, however; this runs fine on the client
        if user.get('id')
          sess.userId = user.get('id') # is necessary?
        else
          model.setNull "users.#{sess.userId}.auth", {'facebook':{}}
          model.set "users.#{sess.userId}.auth.facebook", fbUserMetadata
      fbUserMetadata
  ).redirectPath "/"
  
  # addUser = (source, sourceUser) ->
    # user = undefined
    # if arguments.length is 1 # password-based
      # user = sourceUser = source
      # user.id = ++nextUserId
      # return usersById[nextUserId] = user
    # else # non-password-based
      # user = usersById[++nextUserId] = id: nextUserId
      # user[source] = sourceUser
    # user
  
module.exports.setupQueries = (store) ->
  ## Setup Queries
  store.query.expose 'users', 'withId', (id) ->
    @byId(id)
  store.query.expose 'users', 'withEveryauth', (provider, id) ->
    console.log {withEveryauth:{provider:provider,id:id}}
    @where("auth.#{provider}.id").equals(id)
  store.queryAccess 'users', 'withEveryauth', (methodArgs) ->
    accept = arguments[arguments.length-1]
    accept(true) #for now

module.exports.setupAccessControl = (store) ->
  store.accessControl = true
  
  # Callback signatures here have variable length, eg `callback(captures..., next)` 
  # Is using arguments[n] the correct way to handle this?  

  store.readPathAccess 'users.*', () -> #captures, next) ->
    return unless @session && @session.userId # https://github.com/codeparty/racer/issues/37
    captures = arguments[0]
    next = arguments[arguments.length-1]
    # console.log { readPathAccess: {captures:captures, sessionUserId:@session.userId, next:next} }
    next(captures == @session.userId)
    
  store.writeAccess '*', 'users.*', () -> #captures, value, next) ->
    return unless @session && @session.userId
    captures = arguments[0]
    next = arguments[arguments.length-1]
    pathArray = captures.split('.')
    # console.log { writeAccess: {captures:captures, next:next, pathArray:pathArray, arguments:arguments} }
    next(pathArray[0] == @session.userId)