express = require 'express'
router = new express.Router()

scoring = require '../app/scoring'
_ = require 'underscore'
validator = require 'derby-auth/node_modules/validator'
check = validator.check
sanitize = validator.sanitize
icalendar = require 'icalendar'

NO_TOKEN_OR_UID = err: "You must include a token and uid (user id) in your request"
NO_USER_FOUND = err: "No user found."

# ---------- /api/v1 API ------------
# Every url added beneath router is prefaced by /api/v1

###
  v1 API. Requires api-v1-user (user id) and api-v1-key (api key) headers, Test with:
  $ cd node_modules/racer && npm install && cd ../..
  $ mocha test/api.mocha.coffee
###

auth = (req, res, next) ->
  uid = req.headers['x-api-user']
  token = req.headers['x-api-key']
  return res.json 401, NO_TOKEN_OR_UID unless uid || token

  model = req.getModel()
  query = model.query('users').withIdAndToken(uid, token)

  query.fetch (err, user) ->
    return res.json err: err if err
    req.user = user
    req.userObj = user.get()
    return res.json 401, NO_USER_FOUND if !req.userObj || _.isEmpty(req.userObj)
    req._isServer = true
    next()

router.get '/status', (req, res) ->
  res.json status: 'up'

router.get '/user', auth, (req, res) ->
  user = req.userObj

  delete user.apiToken

  res.json user

router.get '/task/:id', auth, (req, res) ->
  task = req.userObj.tasks[req.params.id]
  return res.json 400, err: "No task found." if !task || _.isEmpty(task)

  res.json 200, task

validateTask = (req, res, next) ->
  task = {}
  newTask = { type, text, notes, value, up, down, completed } = req.body

  # If we're updating, get the task from the user
  if req.method is 'PUT'
    task = req.userObj?.tasks[req.params.id]
    return res.json 400, err: "No task found." if !task || _.isEmpty(task)
    # Strip for now
    type = undefined
    delete newTask.type
  else if req.method is 'POST'
    unless /^(habit|todo|daily|reward)$/.test type
      return res.json 400, err: 'type must be habit, todo, daily, or reward'

  text = sanitize(text).xss()
  notes = sanitize(notes).xss()
  value = sanitize(value).toInt()

  switch type
    when 'habit'
      newTask.up = true unless typeof up is 'boolean'
      newTask.down = true unless typeof down is 'boolean'
    when 'daily', 'todo'
      newTask.completed = false unless typeof completed is 'boolean'

  _.extend task, newTask
  req.task = task
  next()

router.put '/task/:id', auth, validateTask, (req, res) ->
  req.user.set "tasks.#{req.task.id}", req.task

  res.json 200, req.task

router.post '/user/task', auth, validateTask, (req, res) ->
  task = req.task
  type = task.type

  model = req.getModel()
  model.ref '_user', req.user
  model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
  model.at("_#{type}List").push task

  res.json 201, task

router.get '/user/tasks', auth, (req, res) ->
  user = req.userObj
  return res.json 400, NO_USER_FOUND if !user || _.isEmpty(user)

  model = req.getModel()
  model.ref '_user', req.user
  tasks = []
  types = ['habit','todo','daily','reward']
  if /^(habit|todo|daily|reward)$/.test req.query.type
    types = [req.query.type]
  for type in types
    model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
    tasks = tasks.concat model.get("_#{type}List")

  res.json 200, tasks

router.get '/users/:uid/calendar.ics', (req, res) ->
  #return next() #disable for now
  {uid} = req.params
  {apiToken} = req.query

  model = req.getModel()
  query = model.query('users').withIdAndToken(uid, apiToken)
  query.fetch (err, result) ->
    return res.send(400, err) if err
    tasks = result.get('tasks')
    #      tasks = result[0].tasks
    tasksWithDates = _.filter tasks, (task) -> !!task.date
    return res.send(400, "No events found") if _.isEmpty(tasksWithDates)

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
