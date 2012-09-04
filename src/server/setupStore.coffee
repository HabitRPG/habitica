module.exports.queries = (store) ->
  store.query.expose 'users', 'withId', (id) ->
    @byId(id)
    
module.exports.accessControl = (store) ->
  store.accessControl = true
  
  # FIXME callback signatures here have variable length, eg `callback(captures..., next)` 
  # Is using arguments[n] the correct way to handle this?  

  store.readPathAccess 'users.*', () -> #captures, next) ->
    return unless @session && @session.userId # https://github.com/codeparty/racer/issues/37
    captures = arguments[0]
    next = arguments[arguments.length-1]
    console.log { readPathAccess: {captures:captures, sessionUserId:@session.userId, next:next} }
    next(captures == @session.userId)
    
  store.writeAccess '*', 'users.*', () -> #captures, value, next) ->
    return unless @session && @session.userId
    captures = arguments[0]
    next = arguments[arguments.length-1]
    pathArray = captures.split('.')
    console.log { writeAccess: {captures:captures, next:next, pathArray:pathArray, arguments:arguments} }
    next(pathArray[0] == @session.userId)