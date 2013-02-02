content = require './content'
moment = require 'moment'
_ = require 'underscore'
derby = require 'derby'

module.exports.newUserObject = ->
  # deep clone, else further new users get duplicate objects
  newUser = require('lodash').cloneDeep
    lastCron: 'new' #this will be replaced with `+new Date` on first run
    balance: 2
    stats: { money: 0, exp: 0, lvl: 1, hp: 50 }
    items: { itemsEnabled: false, armor: 0, weapon: 0 }
    notifications: { kickstarter: 'show' }
    preferences: { gender: 'm', armorSet: 'v1' }
    tasks: {}
    habitIds: []
    dailyIds: []
    todoIds: []
    rewardIds: []
  for task in content.defaultTasks
    guid = task.id = require('racer').uuid()
    newUser.tasks[guid] = task
    switch task.type
      when 'habit' then newUser.habitIds.push guid
      when 'daily' then newUser.dailyIds.push guid
      when 'todo' then newUser.todoIds.push guid
      when 'reward' then newUser.rewardIds.push guid
  return newUser

module.exports.updateUser = (user, userObj) ->
  user.set 'notifications.kickstarter', 'show' unless userObj.notifications?.kickstarter?

  # Preferences, including API key
  # Some side-stepping to avoid unecessary set (one day, model.update... one day..)
  prefs = _.clone(userObj.preferences)
  prefs = _.defaults prefs, { gender: 'm', armorSet: 'v1', api_token: derby.uuid() }
  user.set 'preferences', prefs unless _.isEqual(prefs, userObj.preferences)

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
    user.set(path, preened) if _.difference(preened, userObj[path]).length != 0