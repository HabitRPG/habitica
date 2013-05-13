derby = require 'derby'

# Include library components
derby.use require('derby-ui-boot'), {styles: []}
derby.use require '../../ui'
derby.use require 'derby-auth/components'

# Init app & reference its functions
app = derby.createApp module
{get, view, ready} = app

# Translations
i18n = require './i18n'
i18n.localize app,
  availableLocales: ['en', 'he', 'bg', 'nl']
  defaultLocale: 'en'
  urlScheme: false
  checkHeader: true

helpers = require './helpers'
helpers.viewHelpers view

_ = require('underscore')

###
  Cleanup task-corruption (null tasks, rogue/invisible tasks, etc)
  Obviously none of this should be happening, but we'll stop-gap until we can find & fix
  Gotta love refLists! see https://github.com/lefnire/habitrpg/issues/803 & https://github.com/lefnire/habitrpg/issues/6343
###
cleanupCorruptTasks = (model) ->
  user = model.at('_user')
  tasks = user.get('tasks')

  ## Remove corrupted tasks
  _.each tasks, (task, key) ->
    unless task?.id? and task?.type?
      user.del("tasks.#{key}")
      delete tasks[key]

  batch = null

  ## Task List Cleanup
  _.each ['habit','daily','todo','reward'], (type) ->

    # 1. remove duplicates
    # 2. restore missing zombie tasks back into list
    idList = user.get("#{type}Ids")
    taskIds =  _.pluck( _.where(tasks, {type:type}), 'id')
    union = _.union idList, taskIds

    # 2. remove empty (grey) tasks
    preened = _.filter union, (id) -> id and _.contains(taskIds, id)

    # There were indeed issues found, set the new list
    if !_.isEqual(idList, preened)
      unless batch?
        batch = new require('./character').BatchUpdate(model)
        batch.startTransaction()
      batch.set("#{type}Ids", preened)
      console.error user.get('id') + "'s #{type}s were corrupt."

  batch.commit() if batch?

###
  Subscribe to the user, the users's party (meta info like party name, member ids, etc), and the party's members. 3 subscriptions.
###
setupSubscriptions = (page, model, params, next, cb) ->
  uuid = model.get('_userId') or model.session.userId # see http://goo.gl/TPYIt
  selfQ = model.query('users').withId(uuid) #keep this for later
  partyQ = model.query('parties').withMember(uuid)

  partyQ.fetch (err, party) ->
    return next(err) if err

    finished = (descriptors, paths) ->
      model.subscribe.apply model, descriptors.concat ->
        [err, refs] = [arguments[0], arguments]
        return next(err) if err
        _.each paths, (path, idx) -> model.ref path, refs[idx+1]
        unless model.get('_user')
          console.error "User not found - this shouldn't be happening!"
          return page.redirect('/logout') #delete model.session.userId
        return cb()

    # (1) Solo player
    return finished([selfQ, 'tavern'], ['_user', '_tavern']) unless party.get()

    ## (2) Party has members, subscribe to those users too
    membersQ = model.query('users').party(party.get('members'))

    # Fetch instead of subscribe. There's nothing dynamic we need from members just yet, they'll update _party instead.
    # This may change in the future.
    membersQ.fetch (err, members) ->
      return next(err) if err
      model.ref '_partyMembers', members

    # Note - selfQ *must* come after membersQ in subscribe, otherwise _user will only get the fields restricted by party-members in store.coffee. Strang bug, but easy to get around
    return finished([partyQ, selfQ, 'tavern'], ['_party', '_user', '_tavern'])

# ========== ROUTES ==========

get '/', (page, model, params, next) ->
  return page.redirect '/' if page.params?.query?.play?

  # removed force-ssl (handled in nginx), see git for code
  setupSubscriptions page, model, params, next, ->
    cleanupCorruptTasks(model) # https://github.com/lefnire/habitrpg/issues/634
    require('./items').server(model)
    #refLists
    _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
      model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
    page.render()


# ========== CONTROLLER FUNCTIONS ==========

ready (model) ->
  user = model.at('_user')
  model.setNull '_user.apiToken', derby.uuid()

  #set cron immediately
  lastCron = user.get('lastCron')
  user.set('lastCron', +new Date) if (!lastCron? or lastCron == 'new')

  require('./scoring').cron(model)

  require('./character').app(exports, model)
  require('./tasks').app(exports, model)
  require('./items').app(exports, model)
  require('./party').app(exports, model, app)
  require('./profile').app(exports, model)
  require('./pets').app(exports, model)
  require('../server/private').app(exports, model)
  require('./debug').app(exports, model) if model.flags.nodeEnv != 'production'
  require('./browser').app(exports, model, app)
  require('./unlock').app(exports, model)
  require('./filters').app(exports, model)
