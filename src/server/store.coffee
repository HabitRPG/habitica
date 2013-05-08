derbyAuth = require('derby-auth/store')

###
Setup read / write access
@param store
###

module.exports.customAccessControl = (store) ->
  userAccess(store)
  partySystem(store)
  tavernSystem(store)
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
    if attrPath is 'party.invitation'
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
  Party permissions
###
partySystem = (store) ->
  store.query.expose "users", "party", (ids) ->
    @where("id").within(ids)
      .only('stats',
            'items',
            'party',
            'profile',
            'achievements',
            'backer',
            'preferences',
            'auth.local.username',
            'auth.facebook.displayName')

  store.queryAccess "users", "party", (ids, accept, err) ->
#    return err(derbyAuth.SESSION_INVALIDATED_ERROR) if derbyAuth.bustedSession(@)
    return accept(false) if derbyAuth.bustedSession(@)
    accept(true) # no harm in public user stats

  store.query.expose "parties", "withId", (id) ->
    @where("id").equals(id)
      .findOne()
  store.queryAccess "parties", "withId", (id, accept, err) ->
#    return err(derbyAuth.SESSION_INVALIDATED_ERROR) if derbyAuth.bustedSession(@)
    return accept(false) if derbyAuth.bustedSession(@)
    accept(true)

  store.readPathAccess "parties.*", ->
    accept = arguments[arguments.length-2]
    accept(true)

  store.writeAccess "*", "parties.*", ->
    accept = arguments[arguments.length-2]
    err = arguments[arguments.length - 1]
#    return err(derbyAuth.SESSION_INVALIDATED_ERROR) if derbyAuth.bustedSession(@)
    return accept(false) if derbyAuth.bustedSession(@)
    accept(true)

  store.query.expose "parties", "withMember", (id) ->
    @where('members').contains([id]).findOne()

  store.queryAccess 'parties', 'withMember', (id, accept, err) ->
    return accept(false) if derbyAuth.bustedSession(@)
    accept(true)

###
  LFG / tavern system
###
tavernSystem = (store) ->
  store.readPathAccess 'tavern', ->
    accept = arguments[arguments.length-2]
    return accept(false) if derbyAuth.bustedSession(@)
    accept(true)

  store.writeAccess "*", "tavern.*", ->
    accept = arguments[arguments.length-2]
    return accept(false) if derbyAuth.bustedSession(@)
    accept(true)

