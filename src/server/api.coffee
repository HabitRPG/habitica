module.exports = (expressApp) ->
  expressApp.get '/:uid/up/:score?', (req, res) ->
    score = parseInt(req.params.score) || 1
    console.log {score:score}
    model = req.getModel()
    model.fetch "users.#{req.params.uid}", (err, user) ->
      return if err || !user.get()
      #TODO run this through scoring to account for weapons & armor, don't just +1
      user.set('stats.exp', parseInt(user.get('stats.exp'))+score)
    res.send(200)
