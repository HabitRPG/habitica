nconf = require('nconf')
express = require 'express'
router = new express.Router()
_ = require('lodash')

router.get '/', (req, res) ->
  res.render 'index',
    title: 'HabitRPG | Your Life, The Role Playing Game'
    env: res.locals.habitrpg

router.get '/partials/tasks', (req, res) -> res.render 'tasks/index'
router.get '/partials/options', (req, res) -> res.render 'options'

module.exports = router