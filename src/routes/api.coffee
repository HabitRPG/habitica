express = require 'express'
router = new express.Router()
api = require '../controllers/api'

###
  ---------- /api/v1 API ------------
  Every url added to router is prefaced by /api/v1
  See ./routes/coffee for routes

  v1 API. Requires x-api-user (user id) and x-api-key (api key) headers, Test with:
  $ cd node_modules/racer && npm install && cd ../..
  $ mocha test/api.mocha.coffee
###

{auth, verifyTaskExists, cron} = api

router.get '/status', (req, res) -> res.json status: 'up'

# Auth
router.post '/register',                  api.registerUser

# Scoring
router.post '/user/task/:id/:direction',  auth, cron, api.scoreTask
router.post '/user/tasks/:id/:direction', auth, cron, api.scoreTask

# Tasks
router.get '/user/tasks',                 auth, cron, api.getTasks
router.get '/user/task/:id',              auth, cron, api.getTask
router.put '/user/task/:id',              auth, cron, verifyTaskExists, api.updateTask
router.post '/user/tasks',                auth, cron, api.updateTasks
router.delete '/user/task/:id',           auth, cron, verifyTaskExists, api.deleteTask
router.post '/user/task',                 auth, cron, api.createTask
router.put '/user/task/:id/sort',         auth, cron, verifyTaskExists, api.sortTask

# Items
router.post '/user/buy/:type',            auth, cron, api.buy

# User
router.get '/user',                       auth, cron, api.getUser
router.post '/user/auth/local',           api.loginLocal
router.post '/user/auth/facebook',        api.loginFacebook
router.put '/user',                       auth, cron, api.updateUser
router.post '/user/revive',               auth, cron, api.revive
router.post '/user/batch-update',         auth, cron, api.batchUpdate

module.exports = router