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
  groupsQ = model.query('groups').withMember(uuid)

  groupsQ.fetch (err, groups, extra) ->
    return next(err) if err
    finished = (descriptors, paths) ->
      model.subscribe.apply model, descriptors.concat ->
        [err, refs] = [arguments[0], arguments]
        return next(err) if err
        _.each paths, (path, idx) -> model.ref path, refs[idx+1]
        unless model.get('_user')
          console.error "User not found - this shouldn't be happening!"
          return page.redirect('/logout') #delete model.session.userId
        extra(arguments) if extra
        return cb()

    groupsObj = groups.get()

    # (1) Solo player
    return finished([selfQ, "groups.habitrpg"], ['_user', '_habitRPG']) if _.isEmpty(groupsObj)

    ## (2) Party or Guild has members, fetch those users too
    groupsInfo = _.reduce groupsObj, ((m,g)->
      if g.type is 'guild' then m.guildIds.push(g.id) else m.partyId = g.id
      m.members = m.members.concat(g.members)
      m
    ), {guildIds:[], partyId:null, members:[]}

    # Fetch, not subscribe. There's nothing dynamic we need from members, just the the Group (below) which includes chat, challenges, etc
    model.query('users').publicInfo(groupsInfo.members).fetch (err, members) ->
      return next(err) if err
      # we need _members as an object in the view, so we can iterate over _party.members as :id, and access _members[:id] for the info
      mObj = members.get()
      model.set "_members", _.object(_.pluck(mObj,'id'), mObj)

    ## Then subscribe to the groups themselves. We separate them by _party, _guilds, and _habitRPG (the "global" guild).
    # Note - selfQ *must* come after membersQ in subscribe, otherwise _user will only get the fields restricted by party-members in store.coffee. Strang bug, but easy to get around
    partyQ = model.query('groups').withIds(groupsInfo.partyId)
    if _.isEmpty(groupsInfo.guildIds)
      finished [partyQ, 'groups.habitrpg', selfQ], ['_party', '_habitRPG', '_user']
    else
      guildsQ = model.query('groups').withIds(groupsInfo.guildIds)
      finished [partyQ, guildsQ, 'groups.habitrpg', selfQ], ['_party', '_guilds', '_habitRPG', '_user']

# ========== ROUTES ==========

get '/', (page, model, params, next) ->
  return page.redirect '/' if page.params?.query?.play?

  model.set '_gamePane', true

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
  require('./challenges').app(exports, model)
