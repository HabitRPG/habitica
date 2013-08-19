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

router.get '/status', (req, res) -> res.json status: 'up'

# Auth
router.post '/register',                  api.registerUser

# Scoring
router.post '/user/task/:id/:direction',  auth, api.scoreTask
router.post '/user/tasks/:id/:direction', auth, api.scoreTask

# Tasks
router.get '/user/tasks',                 auth, api.getTasks
router.get '/user/task/:id',              auth, api.getTask
router.put '/user/task/:id',              auth, validateTask, api.updateTask
router.post '/user/tasks',                auth, api.updateTasks
router.delete '/user/task/:id',           auth, validateTask, api.deleteTask
router.post '/user/task',                 auth, validateTask, api.createTask
router.put '/user/task/:id/sort',         auth, validateTask, api.sortTask

# Items
router.post '/user/buy/:type',            auth, api.buy

# User
router.get '/user',                       auth, api.getUser
router.post '/user/auth/local',           api.loginLocal
router.post '/user/auth/facebook',        api.loginFacebook
router.put '/user',                       auth, api.updateUser
router.post '/user/revive',               auth, api.revive
router.post '/user/batch-update',         auth, api.batchUpdate

module.exports = router