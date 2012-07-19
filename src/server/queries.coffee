module.exports = (store) ->
  store.query.expose 'users', 'withId', (id) ->
    @byId(id)
