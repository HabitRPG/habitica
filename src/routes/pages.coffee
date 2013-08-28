express = require 'express'
router = new express.Router()

router.get '/', (req, res) ->
  res.render 'index', {'HabitRPG | Your Life, The Role Playing Game'}

router.get '/partials/tasks', (req, res) -> res.render 'tasks/index'
router.get '/partials/options', (req, res) -> res.render 'options/index'

module.exports = router