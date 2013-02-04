content = require './content'
moment = require 'moment'
_ = require 'underscore'
lodash = require 'lodash'
derby = require 'derby'

userSchema =
  lastCron: 'new' #this will be replaced with `+new Date` on first run
  balance: 2
  stats: { money: 0, exp: 0, lvl: 1, hp: 50 }
  items: { itemsEnabled: false, armor: 0, weapon: 0 }
  notifications: { kickstarter: 'show' }
  preferences: { gender: 'm', armorSet: 'v1' }
  flags: { partyEnabled: false }
  friends: []
  tasks: {}
  habitIds: []
  dailyIds: []
  todoIds: []
  rewardIds: []

module.exports.newUserObject = ->
  # deep clone, else further new users get duplicate objects
  newUser = require('lodash').cloneDeep userSchema
  for task in content.defaultTasks
    guid = task.id = require('racer').uuid()
    newUser.tasks[guid] = task
    switch task.type
      when 'habit' then newUser.habitIds.push guid
      when 'daily' then newUser.dailyIds.push guid
      when 'todo' then newUser.todoIds.push guid
      when 'reward' then newUser.rewardIds.push guid
  return newUser

module.exports.updateUser = (batch) ->
  user = batch.user

  batch.set('notifications.kickstarter', 'show') unless user.get('notifications.kickstarter')
  batch.set('friends', []) unless !_.isEmpty(user.get('friends'))

  # Preferences, including API key
  # Some side-stepping to avoid unecessary set (one day, model.update... one day..)
  currentPrefs = _.clone user.get('preferences')
  mergedPrefs = _.defaults currentPrefs, { gender: 'm', armorSet: 'v1', api_token: derby.uuid() }
  batch.set('preferences', mergedPrefs)

  ## Task List Cleanup
  # FIXME temporary hack to fix lists (Need to figure out why these are happening)
  # FIXME consolidate these all under user.listIds so we can set them en-masse
  tasks = user.get('tasks')
  _.each ['habit','daily','todo','reward'], (type) ->
    path = "#{type}Ids"

    # 1. remove duplicates
    # 2. restore missing zombie tasks back into list
    taskIds =  _.pluck( _.where(tasks, {type:type}), 'id')
    union = _.union user.get(path), taskIds

    # 2. remove empty (grey) tasks
    preened = _.filter(union, (val) -> _.contains(taskIds, val))

    # There were indeed issues found, set the new list
    batch.set(path, preened) # if _.difference(preened, userObj[path]).length != 0

module.exports.BatchUpdate = BatchUpdate = (model) ->
  user = model.at("_user")
  transactionInProgress = false
  obj = {}
  updates = {}

  {
    user: user

    obj: -> obj

    startTransaction: ->
      # start a batch transaction - nothing between now and @commit() will be set immediately
      transactionInProgress = true
      model._dontPersist = true

      # Really strange, user.get() seems to only return attributes which have previously been accessed. So in
      # many cases, userObj.tasks.{taskId}.value is undefined - so we manually .get() each attribute here.
      # Additionally, for some reason after getting the user object, changing properies manually (userObj.stats.hp = 50)
      # seems to actually run user.set('stats.hp',50) which we don't want to do - so we deepClone here
      #_.each Object.keys(userSchema), (key) -> userObj[key] = lodash.cloneDeep user.get(key)
      obj = lodash.cloneDeep user.get()

    ###
      Handles updating the user model. If this is an en-mass operation (eg, server cron), changes are queued
      but not actually set to the model. It also modifies userObj in case you need to access properties manually later.
      If transaction not in progress, it just runs standard model.set()
    ###
    set: (path, val) ->
      updates[path] = val if transactionInProgress
      user.set(path, val)

    ###
      Hack to get around dom bindings being lost if parent objects are replaced whole-sale
      eg, user.set('stats', {hp:50, exp:10...}) will break dom bindings, but user.set('stats.hp',50) is ok
    ###
    setStats: ->
      that = @
      _.each Object.keys(obj.stats), (key) -> that.set "stats.#{key}", obj.stats[key]

#    queue: (path, val) ->
#      # Special function for setting object properties by string dot-notation. See http://stackoverflow.com/a/6394168/362790
#      arr = path.split('.')
#      arr.reduce (curr, next, index) ->
#         if (arr.length - 1) == index
#           curr[next] = val
#         curr[next]
#      , obj

    commit: ->
      model._dontPersist = false
      # some hackery in our own branched racer-db-mongo, see findAndModify of lefnire/racer-db-mongo#habitrpg index.js
      user.set "update__", updates
      transactionInProgress = false
      updates = {}
  }
