# expose query motifs 
module.exports.queries = (store) ->
  store.query.expose 'users', 'withId', (id) ->
    @byId(id)
    
# setup accessControl
module.exports.accessControl = (store) ->
  
  store.accessControl = true
  
  store.readPathAccess 'users.*', (userId, accept) ->
    console.log accept, 'read.accept'
    accept(userId == @session.userId)
    
  store.writeAccess '*', 'users.*', (mutator, userId, accept) ->
    console.log accept, 'write.accept'
    accept(userId == @session.userId)
