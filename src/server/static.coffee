express = require 'express'
router = new express.Router()

path = require 'path'
derby = require 'derby'

# ---------- Static Pages ------------
staticPages = derby.createStatic path.dirname(path.dirname(__dirname))

router.get '/privacy', (req, res) ->
  staticPages.render 'privacy', res

router.get '/terms', (req, res) ->
  staticPages.render 'terms', res

module.exports = router
