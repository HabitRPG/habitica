derbyAuth = require('derby-auth/store')

###
Setup read / write access
@param store
###

publicAccess = ->
  accept = arguments[arguments.length-2]
  #return err(derbyAuth.SESSION_INVALIDATED_ERROR) if derbyAuth.bustedSession(@)
  return accept(false) if derbyAuth.bustedSession(@)
  accept(true)

module.exports.customAccessControl = (store) ->
  userAccess(store)
  groupSystem(store)
  REST(store)

###
  General user access
###
userAccess = (store) ->

  store.readPathAccess "users.*", -> # captures, accept, err ->
    accept = arguments[arguments.length-2]
    err = arguments[arguments.length - 1]
#    return err(derbyAuth.SESSION_INVALIDATED_ERROR) if derbyAuth.bustedSession(@)
    return accept(false) if derbyAuth.bustedSession(@)

    accept = arguments[arguments.length - 2]
    uid = arguments[0]
    accept (uid is @session.userId) or derbyAuth.isServer(@)

  store.writeAccess "*", "users.*", -> # captures, value, accept, err ->
    accept = arguments[arguments.length-2]
    err = arguments[arguments.length - 1]
    # return err(derbyAuth.SESSION_INVALIDATED_ERROR) if derbyAuth.bustedSession(@)

    return accept(true) if derbyAuth.isServer(@)

    return accept(false) if derbyAuth.bustedSession(@)

    captures = arguments[0].split('.')
    uid = captures.shift()
    attrPath = captures.join('.') # new array shifted left, after shift() was run

    if attrPath is 'backer'
      return accept(false) # we can only manually set this stuff in the database

    # public access to users.*.party.invitation (TODO, lock down a bit more)
    if attrPath.indexOf('invitations.') is 0
      return accept(true)

    # Same session (user.id = this.session.userId)
    return accept(true) if uid is @session.userId

    accept(false)

  store.writeAccess "*", "users.*.balance", (id, newBalance, accept, err) ->
#    return err(derbyAuth.SESSION_INVALIDATED_ERROR) if derbyAuth.bustedSession(@)
    return accept(false) if derbyAuth.bustedSession(@)

    oldBalance = @session.req?._racerModel?.get("users.#{id}.balance") || 0
    purchasingSomethingOnClient = newBalance < oldBalance
    accept(purchasingSomethingOnClient or derbyAuth.isServer(@))

  store.writeAccess "*", "users.*.flags.ads", -> # captures, value, accept, err ->
    accept = arguments[arguments.length - 2]
    err = arguments[arguments.length - 1]
#    return err(derbyAuth.SESSION_INVALIDATED_ERROR) if derbyAuth.bustedSession(@)
    return accept(false) if derbyAuth.bustedSession(@)

    accept(derbyAuth.isServer(@))


###
  REST
  Get user with API token
###
REST = (store) ->
  store.query.expose "users", "withIdAndToken", (uid, token) ->
    @where("id").equals(uid)
      .where('apiToken').equals(token)
      .findOne()

  store.queryAccess "users", "withIdAndToken", (uid, token, accept, err) ->
    return accept(true) if uid && token
    accept(false) # only user has id & token


###
  Party & Guild Permissions
###
groupSystem = (store) ->

  ###
    Public User Info
  ###
  store.query.expose "users", "publicInfo", (ids) ->
    @where("id").within(ids)
      .only('stats',
            'items',
            'invitations',
            'profile',
            'achievements',
            'backer',
            'preferences',
            'auth.local.username',
            'auth.facebook.displayName')
  store.queryAccess "users", "publicInfo", publicAccess

  ###
    Read / Write groups, so they can create new groups
  ###
  store.readPathAccess "groups.*", publicAccess
  store.writeAccess "*", "groups.*", publicAccess

  ###
    Public HabitRPG Guild
  ###
  store.readPathAccess 'groups.habitrpg', publicAccess
  store.writeAccess "*", "groups.habitrpg.chat.*", publicAccess
  store.writeAccess "*", "groups.habitrpg.challenges.*", publicAccess

  ###
    Find group which has member by id
  ###
  store.query.expose "groups", "withMember", (id, type) ->
    q = @where('members').contains([id]).only(['id', 'type', 'name', 'description', 'members' , 'privacy'])
    q = q.where('type').equals(type) if type?
  store.queryAccess 'groups', 'withMember', publicAccess

  ###
    Public Groups Info
  ###
  store.query.expose "groups", "publicGroups", ->
    @where('privacy').equals('public')
      .where('type').equals('guild')
      .only(['id', 'type', 'name', 'description', 'members' , 'privacy'])
  store.queryAccess "groups", "publicGroups", publicAccess

  ###
    Fetch group info (ie, they just got invited)
  ###
  store.query.expose "groups", "withIds", (ids) ->
    return unless ids #FIXME this is sometimes null when ids is array (guilds)
    if typeof ids is 'string'
      @where("id").equals(ids).findOne() # find a single group
    else
      @where("id").within(ids) # find multiple groups
  store.queryAccess "groups", "withIds", publicAccess