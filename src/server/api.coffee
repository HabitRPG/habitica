scoring = require('../app/scoring')

module.exports = (expressApp) ->
  expressApp.get '/:uid/up/:score?', (req, res) ->
    score = parseInt(req.params.score) || 1
    console.log {score:score}
    model = req.getModel()
    model.fetch "users.#{req.params.uid}", (err, user) ->
      return if err || !user.get()
      scoring.score({user:user, direction:'up'})
    res.send(200)

  expressApp.get '/:uid/down/:score?', (req, res) ->
    score = parseInt(req.params.score) || 1
    console.log {score:score}
    model = req.getModel()
    model.fetch "users.#{req.params.uid}", (err, user) ->
      return if err || !user.get()
      scoring.score({user:user, direction:'down'})
    res.send(200)
