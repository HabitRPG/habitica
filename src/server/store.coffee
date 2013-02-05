###
Setup read / write access
@param store
###

module.exports.customAccessControl = (store) ->

#  store.readPathAccess "users.*", () -> # captures, next
#    next = arguments[arguments.length-1]
#    return  unless @session and @session.userId # https://github.com/codeparty/racer/issues/37
#    return next(true)

  store.readPathAccess "users.*", -> # captures, next) ->
    return  unless @session and @session.userId # https://github.com/codeparty/racer/issues/37
    console.log arguments
    captures = arguments[0]
    next = arguments[arguments.length - 1]
    sameSession = captures is @session.userId
    isServer = false #!this.req.socket; //TODO how to determine if request came from server, as in REST?
    next sameSession or isServer

  store.writeAccess "*", "users.*", -> # captures, value, next) ->
    return  unless @session and @session.userId # https://github.com/codeparty/racer/issues/37
    [captures, next] = [arguments[0].split('.'), arguments[arguments.length-1]]
    uid = captures.shift()
    attrPath = captures.join('.') # new array shifted left, after shift() was run

    # TODO the server can write to anything - aka, REST
    #return next(true) if !this.req.socket;

    # public access to users.*.party.invitation (TODO, lock down a bit more)
    console.log attrPath
    return next(true) if (attrPath == 'party.invitation')

    # Same session (user.id = this.session.userId)
    return next(true) if uid is @session.userId

    next(false)


#  store.writeAccess "*", "users.*.balance", (id, newBalance, next) ->
#    return  unless @session and @session.userId # https://github.com/codeparty/racer/issues/37
#    purchasingSomethingOnClient = newBalance < this.session.req._racerModel.get("users.#{id}.balance")
#    isServer = not @req.socket
#    next(purchasingSomethingOnClient or isServer)

  store.writeAccess "*", "users.*.flags.ads", -> # captures, value, next ->
    return  unless @session and @session.userId # https://github.com/codeparty/racer/issues/37
    next = arguments[arguments.length - 1]
    isServer = not @req.socket
    next(isServer)

  ###
    Get user with API token
  ###
  store.query.expose "users", "withIdAndToken", (id, api_token) ->
    @where("id").equals(id)
      .where('preferences.api_token').equals(api_token)
      .limit(1)

  store.queryAccess "users", "withIdAndToken", (id, token, next) ->
    return next(false) unless @session and @session.userId # https://github.com/codeparty/racer/issues/37
    isServer = not @req.socket
    next(isServer)

  ###
    Party permissions
  ###
  store.query.expose "users", "party", (ids) ->
    @where("id").within(ids)
      .only('stats',
            'items',
            'party',
            'preferences.gender',
            'preferences.armorSet',
            'auth.local.username',
            'auth.facebook.displayName')

  store.queryAccess "users", "party", (ids, next) ->
    next(true) # no harm in public user stats

  store.query.expose "parties", "withId", (id) ->
    @where("id").equals(id)
  store.queryAccess "parties", "withId", (id, next) ->
    next(true)

  store.readPathAccess "parties.*", ->
    arguments[arguments.length-1](true)

  store.writeAccess "*", "parties.*", ->
    arguments[arguments.length-1](true)
