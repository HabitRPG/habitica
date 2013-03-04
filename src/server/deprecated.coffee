express = require 'express'
router = new express.Router()

scoring = require '../app/scoring'
_ = require 'underscore'
icalendar = require('icalendar')
api = require './api'

# ---------- Deprecated Paths ------------

deprecatedMessage = 'This API is no longer supported, see https://github.com/lefnire/habitrpg/wiki/API for new protocol'

router.get '/:uid/up/:score?', (req, res) -> res.send(500, deprecatedMessage)
router.get '/:uid/down/:score?', (req, res) -> res.send(500, deprecatedMessage)
router.post '/users/:uid/tasks/:taskId/:direction', (req, res) -> res.send(500, deprecatedMessage)

# Redirect to new API
initDeprecated = (req, res, next) ->
  req.headers['x-api-user'] = req.params.uid
  req.headers['x-api-key'] = req.body.apiToken
  next()

router.post '/v1/users/:uid/tasks/:taskId/:direction', initDeprecated, api.auth, api.scoreTask

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
