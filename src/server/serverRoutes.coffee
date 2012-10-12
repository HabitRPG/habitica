scoring = require('../app/scoring')

module.exports = (expressApp, root, derby) ->

  staticPages = derby.createStatic root
  
  expressApp.get '/:uid/up/:score?', (req, res) ->
    score = parseInt(req.params.score) || 1
    model = req.getModel()
    model.fetch "users.#{req.params.uid}", (err, user) ->
      return if err || !user.get()
      scoring.setModel(model)
      scoring.score({direction:'up'})
    res.send(200)

  expressApp.get '/:uid/down/:score?', (req, res) ->
    score = parseInt(req.params.score) || 1
    model = req.getModel()
    model.fetch "users.#{req.params.uid}", (err, user) ->
      return if err || !user.get()
      scoring.setModel(model)
      scoring.score({direction:'down'})
    res.send(200)
    
  expressApp.get '/privacy', (req, res) ->
    staticPages.render 'privacy', res
  
  expressApp.get '/terms', (req, res) ->
    staticPages.render 'terms', res

  expressApp.post '/', (req) ->
    require('../app/reroll').stripeResponse(req)

  expressApp.all '*', (req) ->
    throw "404: #{req.url}"
