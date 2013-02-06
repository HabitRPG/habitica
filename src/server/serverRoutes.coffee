scoring = require('../app/scoring')
_ = require('underscore')

module.exports = (expressApp, root, derby) ->

  # ---------- Static Pages ------------
  staticPages = derby.createStatic root
    
  expressApp.get '/privacy', (req, res) ->
    staticPages.render 'privacy', res
  
  expressApp.get '/terms', (req, res) ->
    staticPages.render 'terms', res

  # ---------- Deprecated Paths ------------

  deprecatedMessage = 'This API is no longer supported, see https://github.com/lefnire/habitrpg/wiki/API for new protocol'
  expressApp.get '/:uid/up/:score?', (req, res) -> res.send(500, deprecatedMessage)
  expressApp.get '/:uid/down/:score?', (req, res) -> res.send(500, deprecatedMessage)
  expressApp.post '/users/:uid/tasks/:taskId/:direction', (req, res) -> res.send(500, deprecatedMessage)

  # ---------- v1 API ------------

  ###
    v1 API. Requires user-id and apiToken, task-id, direction. Test with:
    curl -X POST -H "Content-Type:application/json" -d '{"apiToken":"{TOKEN}"}' localhost:3000/v1/users/{UID}/tasks/productivity/up
  ###
  expressApp.post '/v1/users/:uid/tasks/:taskId/:direction', (req, res) ->
    {uid, taskId, direction} = req.params
    {apiToken, title, service, icon} = req.body
    console.log {params:req.params, body:req.body} if process.env.NODE_ENV == 'development'

    # Send error responses for improper API call
    return res.send(500, 'request body "apiToken" required') unless apiToken
    return res.send(500, ':uid required') unless uid
    return res.send(500, ':taskId required') unless taskId
    return res.send(500, ":direction must be 'up' or 'down'") unless direction in ['up','down']

    model = req.getModel()
    req._isServer = true
    model.fetch model.query('users').withIdAndToken(uid, apiToken), (err, result) ->
      return res.send(500, err) if err
      user = result.at(0)
      userObj = user.get()
      if _.isEmpty(userObj)
        return res.send(500, "User with uid=#{uid}, token=#{apiToken} not found. Make sure you're not using your username, but your User Id")
       
      model.ref('_user', user)
      
      # Create task if doesn't exist
      # TODO add service & icon to task
      unless model.get("_user.tasks.#{taskId}")
        model.refList "_habitList", "_user.tasks", "_user.idLists.habit"
        model.at('_habitList').push {
          id: taskId
          type: 'habit'
          text: (title || taskId)
          value: 0
          up: true
          down: true
          notes: "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."
        }, (a,b,c) ->
          console.log {a:a,b:b,c:c}


      scoring.setModel(model)
      delta = scoring.score(taskId, direction)
      result = model.get ('_user.stats')
      result.delta = delta
      res.send(result)