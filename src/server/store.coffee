###
Setup read / write access
@param store
###

module.exports.customAccessControl = (store) ->
  userAccess(store)
  partySystem(store)
  REST(store)

###
  General user access
###
userAccess = (store) ->

  store.readPathAccess "users.*", -> # captures, next) ->
    next = arguments[arguments.length - 1]
    return next(true) unless @session?.userId # https://github.com/codeparty/racer/issues/37
    uid = arguments[0]
    next (uid is @session.userId) or @session.req?._isServer

  store.writeAccess "*", "users.*", -> # captures, value, next) ->
    next = arguments[arguments.length-1]
    return next(true) unless @session?.userId # https://github.com/codeparty/racer/issues/37
    captures = arguments[0].split('.')
    uid = captures.shift()
    attrPath = captures.join('.') # new array shifted left, after shift() was run

    # public access to users.*.party.invitation (TODO, lock down a bit more)
    if (attrPath == 'party.invitation')
      return next(true)

    # Same session (user.id = this.session.userId)
    if (uid is @session.userId) or @session.req?._isServer
      return next(true)

    next(false)

  store.writeAccess "*", "users.*.balance", (id, newBalance, next) ->
    return next(true) unless @session?.userId # https://github.com/codeparty/racer/issues/37
    oldBalance = @session.req._racerModel?.get("users.#{id}.balance") || 0
    purchasingSomethingOnClient = newBalance < oldBalance
    next(purchasingSomethingOnClient or @session.req?._isServer)

  store.writeAccess "*", "users.*.flags.ads", -> # captures, value, next ->
    next = arguments[arguments.length - 1]
    return next(true) unless @session?.userId # https://github.com/codeparty/racer/issues/37
    next(@session.req?._isServer)


###
  REST
  Get user with API token
###
REST = (store) ->
  store.query.expose "users", "withIdAndToken", (id, apiToken) ->
    @where("id").equals(id)
      .where('apiToken').equals(apiToken)
      .limit(1)

  store.queryAccess "users", "withIdAndToken", (id, apiToken, next) ->
    return next(true) unless @session?.userId # https://github.com/codeparty/racer/issues/37
    next(true) # only user has id & token


###
  Party permissions
###
partySystem = (store) ->
  store.query.expose "users", "party", (ids) ->
    @where("id").within(ids)
      .only('stats',
            'items',
            'party',
            'preferences',
            'auth.local.username',
            'auth.facebook.displayName')

  store.queryAccess "users", "party", (ids, next) ->
    next(true) # no harm in public user stats

  store.query.expose "parties", "withId", (id) ->
    @where("id").equals(id)
  store.queryAccess "parties", "withId", (id, next) ->
    next(true)

  store.readPathAccess "parties.*", ->
    next = arguments[arguments.length-1]
    next(true)

  store.writeAccess "*", "parties.*", ->
    next = arguments[arguments.length-1]
    next(true)