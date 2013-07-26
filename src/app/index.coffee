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

misc = require('./misc')
misc.viewHelpers view

_ = require('lodash')
algos = require 'habitrpg-shared/script/algos'


###
  Subscribe to the user, the users's party (meta info like party name, member ids, etc), and the party's members. 3 subscriptions.
###
setupSubscriptions = (page, model, params, next, cb) ->
  uuid = model.get('_userId') or model.session.userId # see http://goo.gl/TPYIt
  selfQ = model.query('users').withId(uuid) #keep this for later

  # Note: due to https://github.com/codeparty/racer/issues/57, this has to come at the very beginning. The more limited
  # the returned fields in motifs, the sooner they must come in fetch / subscribes.
  publicGroupsQuery = model.query('groups').publicGroups()
  myGroupsQuery = model.query('groups').withMember(uuid)
  model.fetch publicGroupsQuery, myGroupsQuery, (err, publicGroups, groups) ->
    return next(err) if err
    finished = (descriptors, paths) ->
      # Add public "Tavern" guild in
      descriptors.unshift('groups.habitrpg'); paths.unshift('_habitRPG')

      # Subscribe to each descriptor
      model.subscribe.apply model, descriptors.concat ->
        [err, refs] = [arguments[0], arguments]
        return next(err) if err
        _.each paths, (path, idx) -> model.ref path, refs[idx+1]; true
        unless model.get('_user')
          console.error "User not found - this shouldn't be happening!"
          return page.redirect('/logout') #delete model.session.userId
        return cb()

    # Get public groups first, order most-to-least # subscribers
    model.set '_publicGroups', _.sortBy(publicGroups.get(), (g) -> -_.size(g.members))

    groupsObj = groups.get()

    # (1) Solo player
    return finished([selfQ], ['_user']) if _.isEmpty(groupsObj)

    ## (2) Party or Guild has members, fetch those users too
    # Subscribe to the groups themselves. We separate them by _party, _guilds, and _habitRPG (the "global" guild).
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
      model.set "_membersArray", mObj

      # Note - selfQ *must* come after membersQ in subscribe, otherwise _user will only get the fields restricted by party-members in store.coffee. Strang bug, but easy to get around
      descriptors = [selfQ]; paths = ['_user']
      if groupsInfo.partyId
        descriptors.unshift model.query('groups').withIds(groupsInfo.partyId)
        paths.unshift '_party'
      unless _.isEmpty(groupsInfo.guildIds)
        descriptors.unshift model.query('groups').withIds(groupsInfo.guildIds)
        paths.unshift '_guilds'
      finished descriptors, paths


# ========== ROUTES ==========

get '/', (page, model, params, next) ->
  return page.redirect '/' if page.params?.query?.play?

  # removed force-ssl (handled in nginx), see git for code
  setupSubscriptions page, model, params, next, ->
    require('./items').server(model)
    #refLists
    _.each ['habit', 'daily', 'todo', 'reward'], (type) ->
      model.refList "_#{type}List", "_user.tasks", "_user.#{type}Ids"
      true
    page.render()


# ========== CONTROLLER FUNCTIONS ==========

ready (model) ->
  user = model.at('_user')
  misc.fixCorruptUser(model) # https://github.com/lefnire/habitrpg/issues/634

  browser = require './browser'
  require('./tasks').app(exports, model)
  require('./items').app(exports, model)
  require('./groups').app(exports, model, app)
  require('./profile').app(exports, model)
  require('./pets').app(exports, model)
  require('../server/private').app(exports, model)
  require('./debug').app(exports, model) if model.flags.nodeEnv != 'production'
  browser.app(exports, model, app)
  require('./unlock').app(exports, model)
  require('./filters').app(exports, model)
  require('./challenges').app(exports, model)

  # used for things like remove website, chat, etc
  exports.removeAt = (e, el) ->
    if (confirmMessage = $(el).attr 'data-confirm')?
      return unless confirm(confirmMessage) is true
    e.at().remove()
    browser.resetDom(model) if $(el).attr('data-refresh')

  ###
    Cron
  ###
  misc.batchTxn model, (uObj, paths) ->
    # habitrpg-shared/algos requires uObj.habits, uObj.dailys etc instead of uObj.tasks
    _.each ['habit','daily','todo','reward'], (type) -> uObj["#{type}s"] = _.where(uObj.tasks, {type}); true
    algos.cron uObj, {paths}
    # for new user, just set lastCron - no need to reset dom.
    # remember that the properties are set from uObj & paths AFTER the return of this callback
    return if _.isEmpty(paths) or (paths['lastCron'] and _.size(paths) is 1)
    # for everyone else, we need to reset dom - too many changes have been made and won't it breaks dom listeners.
    if paths['stats.hp']
      delete paths['stats.hp'] # we'll set this manually so we can get a cool animation
      setTimeout ->
        browser.resetDom(model)
        user.set 'stats.hp', uObj.stats.hp
      , 750
  ,{cron:true}