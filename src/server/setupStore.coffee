module.exports.queries = (store) ->
  store.query.expose 'users', 'withId', (id) ->
    @byId(id)
    
module.exports.accessControl = (store) ->
  
  # store.accessControl = true
  
  # FIXME 
  # getting Property 'callback' of object 0,b800598e-0cc5-41e7-931f-431b8888e07a.2,set,users.be06f5d3-5ffd-4a9a-828f-87c5f43d3562,[object Object] is not a function
  # at Object.module.exports.server._commit.res.fail (node_modules/derby/node_modules/racer/lib/txns/txns.Model.js:319:22)
  # at node_modules/derby/node_modules/racer/lib/accessControl/accessControl.Store.js:221:34
  
  store.readPathAccess 'users.*', (userId, accept) ->
    console.log accept, 'read.accept'
    accept(userId == @session.userId)
    
  store.writeAccess '*', 'users.*', (mutator, userId, accept) ->
    console.log accept, 'write.accept'
    accept(userId == @session.userId)
