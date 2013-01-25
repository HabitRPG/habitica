###
Setup read / write access
@param store
###
module.exports = (store) ->

  store.writeAccess "*", "users.*.balance", (id, newBalance, next) ->
    return  unless @session and @session.userId # https://github.com/codeparty/racer/issues/37
    purchasingSomethingOnClient = newBalance < this.session.req._racerModel.get("users.#{id}.balance")
    isServer = not @req.socket
    next(purchasingSomethingOnClient or isServer)

  store.writeAccess "*", "users.*.flags.ads", -> # captures, value, next ->
    return  unless @session and @session.userId # https://github.com/codeparty/racer/issues/37
    next = arguments[arguments.length - 1]
    isServer = not @req.socket
    next(isServer)