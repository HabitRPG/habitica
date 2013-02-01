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
  userObj = batch.userObj

  batch.queue('notifications.kickstarter', 'show') unless userObj.notifications?.kickstarter?
  batch.queue('friends', []) unless !_.isEmpty(userObj.friends)

  # Preferences, including API key
  # Some side-stepping to avoid unecessary set (one day, model.update... one day..)
  prefs = _.clone(userObj.preferences)
  _.defaults prefs, { gender: 'm', armorSet: 'v1', api_token: derby.uuid() }
  batch.queue('preferences', prefs) unless _.isEqual(prefs, userObj.preferences)

  ## Task List Cleanup
  # FIXME temporary hack to fix lists (Need to figure out why these are happening)
  # FIXME consolidate these all under user.listIds so we can set them en-masse
  _.each ['habit','daily','todo','reward'], (type) ->
    path = "#{type}Ids"

    # 1. remove duplicates
    # 2. restore missing zombie tasks back into list
    where = {type:type}
    taskIds =  _.pluck( _.where(userObj.tasks, where), 'id')
    union = _.union userObj[path], taskIds

    # 2. remove empty (grey) tasks
    preened = _.filter(union, (val) -> _.contains(taskIds, val))

    # There were indeed issues found, set the new list
    # TODO _.difference might still be empty for duplicates in one list?
    batch.queue(path, preened) if _.difference(preened, userObj[path]).length != 0

module.exports.BatchUpdate = BatchUpdate = (model) ->
  user = model.at('_user')

  # this is really stupid, but i can't find how to get around user.get() making only available what has been gotten specifically before
  obj = {}
  _.each Object.keys(userSchema), (key) -> obj[key] = user.get(key)
  userObj = lodash.cloneDeep obj  # whaaa??? modifying userObj modifies the value of user.get() at that path?

  updates = {}
  {
    queue: (path, val) -> updates[path] = val

    userObj: userObj

    ###
      Handles updating the user model. If this is an en-mass operation (eg, server cron), pass the user object as {update}.
      otherwise, null means commit the changes immediately
    ###
    updateAndQueue: (path, val) ->
      @queue path, val
      # Special function for setting object properties by string dot-notation. See http://stackoverflow.com/a/6394168/362790
      arr = path.split('.')
      arr.reduce (curr, next, index) ->
         if (arr.length - 1) == index
           curr[next] = val
         curr[next]
      , userObj

    commit: ->
      commit = model._commit
      model._commit = (txn) ->
        txn.dontPersist = true
        commit.apply(model, arguments)
      _.each updates, (val, path) ->
        if path == 'stats.hp' then debugger
        user.set(path, val)
      model._commit = commit
      user.set "update__", updates # some hackery in our own branched racer-db-mongo, see findAndModify
  }
