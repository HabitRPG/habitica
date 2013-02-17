derby = require 'derby'
{get, view, ready} = derby.createApp module
derby.use require('derby-ui-boot'), {styles: ['bootstrap', 'responsive']}
derby.use require '../../ui'
derby.use require 'derby-auth/components'

# Custom requires
character = require './character'
tasks = require './tasks'
scoring = require './scoring'
helpers = require './helpers'
browser = require './browser'
party = require './party'
items = require './items'
profile = require './profile'

helpers.viewHelpers view
character.view view
tasks.view view
items.view view

_ = require('underscore')

# ========== ROUTES ==========

get '/', (page, model, next) ->
  # temporary view variables, so we don't call model.set() too fast
  _view = model.get '_view' || {}

  # Force SSL # NOTE handled by ngix now
  #req = page._res.req
  #if req.headers['x-forwarded-proto']!='https' and process.env.NODE_ENV=='production'
  #  return page.redirect 'https://' + req.headers.host + req.url

  # This used to be in party.server(model, cb), but was getting `TypeError: Object #<Model> has no method 'server'`
  # on the second load for some reason
  selfQ = model.query('users').withId(model.get('_userId') or model.session.userId)
  model.subscribe selfQ, (err, users) ->
    throw err if err

    user = users.at(0)
    model.ref '_user', user
    model.set '_view', _view

    character.updateUser(model)
    items.server(model)

    party.partySubscribe model, ->
      browser.restoreRefs model
      page.render()

# ========== CONTROLLER FUNCTIONS ==========

ready (model) ->
  user = model.at('_user')
  scoring.setModel(model)

  #set cron immediately
  lastCron = user.get('lastCron')
  user.set('lastCron', +new Date) if (!lastCron? or lastCron == 'new')

  scoring.cron()

  browser.app(exports, model)
  character.app(exports, model)
  tasks.app(exports, model)
  items.app(exports, model)
  party.app(exports, model)
  profile.app(exports, model)
  require('../server/private').app(exports, model)
  require('./debug').app(exports, model) if model.get('_view.nodeEnv') != 'production'

