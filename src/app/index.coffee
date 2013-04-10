derby = require 'derby'
app = derby.createApp module

{get, view, ready} = app
derby.use require('derby-ui-boot'), {styles: []}
derby.use require '../../ui'
derby.use require 'derby-auth/components'

# Translations
i18n = require './i18n'
i18n.localize app,
  availableLocales: ['en', 'he']
  defaultLocale: 'en'

helpers = require './helpers'
helpers.viewHelpers view

_ = require('underscore')

# ========== ROUTES ==========

get '/', (page, model, params, next) ->
  return page.redirect '/' if page.params?.query?.play?

  # Force SSL # NOTE handled by ngix now
  #req = page._res.req
  #if req.headers['x-forwarded-proto']!='https' and process.env.NODE_ENV=='production'
  #  return page.redirect 'https://' + req.headers.host + req.url

  require('./party').partySubscribe page, model, params, next, ->
    user = model.at('_user')
    user.setNull('apiToken', derby.uuid())

    require('./items').server(model)

    #refLists
    _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
      model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"

    # Cleanup some task-corruption (null tasks, rogue/invisible tasks, etc)
    # Obviously none of this should be happening, but we'll stop-gap until we can find & fix
    tasks = user.get('tasks')
    _.each tasks, (task, key) ->
      # Remove null tasks
      unless task?.type?
        user.del("tasks.#{key}")
        # Put rogue tasks back into their lists. We could alternatively delete them (they're rogue because they weren't properly deleted), but that's dangerous
      else if user.get("#{task.type}Ids").indexOf(task.id) is -1
        user.push "#{task.type}Ids", task.id

    page.render()

# ========== CONTROLLER FUNCTIONS ==========

ready (model) ->
  user = model.at('_user')

  #set cron immediately
  lastCron = user.get('lastCron')
  user.set('lastCron', +new Date) if (!lastCron? or lastCron == 'new')

  require('./scoring').cron(model)

  require('./character').app(exports, model)
  require('./tasks').app(exports, model)
  require('./items').app(exports, model)
  require('./party').app(exports, model)
  require('./profile').app(exports, model)
  require('./pets').app(exports, model)
  require('../server/private').app(exports, model)
  require('./debug').app(exports, model) if model.flags.nodeEnv != 'production'
  require('./browser').app(exports, model, app)

