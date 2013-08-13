express = require 'express'
router = new express.Router()
api = require './api'

###
  ---------- /api/v1 API ------------
  Every url added to router is prefaced by /api/v1
  See ./routes/coffee for routes

  v1 API. Requires x-api-user (user id) and x-api-key (api key) headers, Test with:
  $ cd node_modules/racer && npm install && cd ../..
  $ mocha test/api.mocha.coffee
###

{auth, validateTask, cron} = api

###
  We don't want the api functions to actually res.send results (unless there was an error)
  because we'll be re-using the same functions when apiv2 rolls around, but returning different results.
  So handle sending results for apiv1 here
###
v1Send = (req, res, next) ->
  {result} = req.habit
  if (result.code and result.data) then res.json result.code, result.data
  else if result.code then res.send result.code
  else if result.data then res.json result.data
  else res.send 200

router.get '/status', (req, res) -> res.json status: 'up'

# Scoring
router.post '/user/task/:id/:direction',  auth, cron, api.scoreTask, v1Send
router.post '/user/tasks/:id/:direction', auth, cron, api.scoreTask, v1Send

# Tasks
router.get '/user/tasks',                 auth, cron, api.getTasks, v1Send # plural
router.get '/user/task/:id',              auth, cron, api.getTask, v1Send
router.put '/user/task/:id',              auth, cron, validateTask, api.updateTask, v1Send
router.post '/user/tasks',                auth, cron, api.updateTasks, v1Send # plural
router.delete '/user/task/:id',           auth, cron, validateTask, api.deleteTask, v1Send
router.post '/user/task',                 auth, cron, validateTask, api.createTask, v1Send
router.put '/user/task/:id/sort',         auth, cron, validateTask, api.sortTask, v1Send

# Items
router.post '/user/buy/:type',            auth, cron, api.buy, v1Send

# User
router.get '/user',                       auth, cron, api.getUser, v1Send
router.post '/user/auth/local',           api.loginLocal, v1Send
router.post '/user/auth/facebook',        api.loginFacebook, v1Send
router.put '/user',                       auth, cron, api.updateUser, v1Send
router.post '/user/revive',               auth, cron, api.revive, v1Send
router.post '/user/batch-update',         auth, cron, api.batchUpdate # this one we're handling specially

module.exports = router