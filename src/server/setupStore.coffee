module.exports.queries = (store) ->
  store.query.expose 'users', 'withId', (id) ->
    @byId(id)
    
module.exports.accessControl = (store) ->
  
  store.accessControl = true
  
  store.readPathAccess 'users.*', (captures, next) ->
    allowed = (captures == @session.userId)
    # console.log { readPathAccess: {captures:captures, sessionUserId:@session.userId, allowed:allowed, next:next} }
    next(allowed)
    
  store.writeAccess '*', 'users.*', (captures, value, next) ->
    pathArray = captures.split('.')
    allowed = (pathArray[0] == @session.userId)
    # console.log { writeAccess: {captures:captures, value:value, next:next, pathArray:pathArray} }
    next(allowed)
