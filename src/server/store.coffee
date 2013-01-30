###
Setup read / write access
@param store
###
module.exports = (store) ->

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
  store.query.expose "users", "friends", (ids) ->
    @where("id").within(ids)
      .only('stats', 'preferences.gender', 'preferences.armorSet', 'items', 'auth.local.username', 'auth.facebook.displayName')

  store.queryAccess "users", "friends", (ids, next) ->
    next(true) # no harm in public user stats
