express = require 'express'
router = new express.Router()

scoring = require '../app/scoring'
_ = require 'underscore'
icalendar = require('icalendar')

# ---------- Deprecated Paths ------------

deprecatedMessage = 'This API is no longer supported, see https://github.com/lefnire/habitrpg/wiki/API for new protocol'

router.get '/:uid/up/:score?', (req, res) -> res.send(500, deprecatedMessage)
router.get '/:uid/down/:score?', (req, res) -> res.send(500, deprecatedMessage)
router.post '/users/:uid/tasks/:taskId/:direction', (req, res) -> res.send(500, deprecatedMessage)

router.post '/v1/users/:uid/tasks/:taskId/:direction', (req, res) ->
  {uid, taskId, direction} = req.params
  {apiToken, title, service, icon} = req.body
  console.log {params:req.params, body:req.body} if process.env.NODE_ENV == 'development'

  # Send error responses for improper API call
  return res.send(500, 'request body "apiToken" required') unless apiToken
  return res.send(500, ':uid required') unless uid
  return res.send(500, ':taskId required') unless taskId
  return res.send(500, ":direction must be 'up' or 'down'") unless direction in ['up','down']

  model = req.getModel()
  model.fetch model.query('users').withIdAndToken(uid, apiToken), (err, result) ->
    return res.send(500, err) if err
    user = result
    userObj = user.get()
    if _.isEmpty(userObj)
      return res.send(500, "User with uid=#{uid}, token=#{apiToken} not found. Make sure you're not using your username, but your User Id")

    model.ref('_user', user)
    req._isServer = true

    # Create task if doesn't exist
    # TODO add service & icon to task
    unless model.get("_user.tasks.#{taskId}")
      model.refList "_habitList", "_user.tasks", "_user.habitIds"
      model.at('_habitList').push
        id: taskId
        type: 'habit'
        text: (title || taskId)
        value: 0
        up: true
        down: true
        notes: "This task was created by a third-party service. Feel free to edit, it won't harm the connection to that service. Additionally, multiple services may piggy-back off this task."

    score = new scoring.Scoring(model)
    delta = score.score(taskId, direction)
    result = model.get ('_user.stats')
    result.delta = delta
    res.send(result)

router.get '/v1/users/:uid/calendar.ics', (req, res) ->
  #return next() #disable for now
  {uid} = req.params
  {apiToken} = req.query

  model = req.getModel()
  query = model.query('users').withIdAndToken(uid, apiToken)
  query.fetch (err, result) ->
    return res.send(500, err) if err
    tasks = result.get('tasks')
    #      tasks = result[0].tasks
    tasksWithDates = _.filter tasks, (task) -> !!task.date
    return res.send(500, "No events found") if _.isEmpty(tasksWithDates)

    ical = new icalendar.iCalendar()
    ical.addProperty('NAME', 'HabitRPG')
    _.each tasksWithDates, (task) ->
      event = new icalendar.VEvent(task.id);
      event.setSummary(task.text);
      d = new Date(task.date)
      d.date_only = true
      event.setDate d
      ical.addComponent event
    res.type('text/calendar')
    formattedIcal = ical.toString().replace(/DTSTART\:/g, 'DTSTART;VALUE=DATE:')
    res.send(200, formattedIcal)

module.exports = router
