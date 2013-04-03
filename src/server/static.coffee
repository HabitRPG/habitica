express = require 'express'
router = new express.Router()

path = require 'path'
derby = require 'derby'

# ---------- Static Pages ------------
staticPages = derby.createStatic path.dirname(path.dirname(__dirname))

beforeEach = (req, res, next) ->
  req.getModel().set '_view', {nodeEnv: 'production'} # we don't want cheat buttons on static pages
  next()

router.get '/splash.html', (req, res) -> return res.redirect('/static/front')
router.get '/static/front',   beforeEach, (req, res) -> staticPages.render 'static/front', res
router.get '/static/about',   beforeEach, (req, res) -> staticPages.render 'static/about', res
router.get '/static/team',    beforeEach, (req, res) -> staticPages.render 'static/team', res
router.get '/static/extensions',    beforeEach, (req, res) -> res.redirect 'http://community.habitrpg.com/extensions', res
router.get '/static/faq',    (req, res) -> res.redirect 'http://community.habitrpg.com/faq-page'

router.get '/static/privacy', beforeEach, (req, res) -> staticPages.render 'static/privacy', res
router.get '/static/terms',   beforeEach, (req, res) -> staticPages.render 'static/terms', res

module.exports = router
