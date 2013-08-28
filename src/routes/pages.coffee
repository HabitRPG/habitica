nconf = require('nconf')
express = require 'express'
router = new express.Router()

router.get '/', (req, res) ->
  res.render 'index',
    title: 'HabitRPG | Your Life, The Role Playing Game'
    NODE_ENV: nconf.get('NODE_ENV')


router.get '/partials/tasks', (req, res) -> res.render 'tasks/index'
router.get '/partials/options', (req, res) -> res.render 'options'

module.exports = router