derby = require('derby')
schema = require('../app/schema')
content = require('../app/content')

# Need this for later use by EveryAuth in the MiddleWare
req = undefined
module.exports.setRequest = (r) ->
  req = r
  
module.exports.newUserAndPurl = ->
  model = req.getModel()
  sess = model.session
  uidParam = req.url.split('/')[1]

  ## -------- (1) New user --------
  # They get to play around before creating a new account.
  unless sess.userId
    sess.userId = derby.uuid()
    model.set "users.#{sess.userId}", schema.newUserObject()

  ## -------- (2) PURL --------
  # eg, http://localhost/{guid}), legacy - will be removed eventually
  # tests if UUID was used (bookmarked private url), and restores that session
  acceptableUid = require('guid').isGuid(uidParam) or (uidParam == '3')
  if acceptableUid && sess.userId!=uidParam && !(sess.habitRpgAuth && sess.habitRpgAuth.facebook)
    # TODO check if in database - issue with accessControl which is on current uid?
    sess.userId = uidParam

module.exports.setupEveryauth = (everyauth) ->
  everyauth.debug = true
  
  everyauth.everymodule.findUserById (id, callback) ->
    # will never be called, can't fetch user from database at this point on the server
    # see https://github.com/codeparty/racer/issues/39. Handled in app/auth.coffee for now
    callback null, null
  
  # Facebook Authentication Logic 
  everyauth
    .facebook
    .appId(process.env.FACEBOOK_KEY)
    .appSecret(process.env.FACEBOOK_SECRET)
    .findOrCreateUser( (session, accessToken, accessTokenExtra, fbUserMetadata) ->

      # Put it in the session for later use
      # FIXME shouldn't this be set by everyauth? (session.auth.facebook)
      session.habitRpgAuth ||= {}
      session.habitRpgAuth.facebook = fbUserMetadata.id

      model = req.getModel()
      q = model.query('users').withEveryauth('facebook', fbUserMetadata.id)
      model.fetch q, (err, user) ->
        id = user && user.get() && user.get()[0].id
        console.log {err:err, id:id, fbUserMetadata:fbUserMetadata}
        # Has user been tied to facebook account already?
        if (id && id!=session.userId)
          session.userId = id
        # Else tie user to their facebook account
        else
          model.setNull "users.#{session.userId}.auth", {'facebook':{}}
          model.set "users.#{session.userId}.auth.facebook", fbUserMetadata

      fbUserMetadata
  ).redirectPath "/"

  everyauth.everymodule.handleLogout (req, res) ->
    if req.session.habitRpgAuth && req.session.habitRpgAuth.facebook
      req.session.habitRpgAuth.facebook = undefined
    req.session.userId = undefined
    req.logout() # The logout method is added for you by everyauth, too
    @redirect res, @logoutRedirectPath()

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