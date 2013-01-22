content = require './content'
moment = require 'moment'
_ = require 'underscore'

module.exports.userSchema = ->
  # deep clone, else further new users get duplicate objects
  newUser = require('lodash').cloneDeep
    balance: 2
    stats: { money: 0, exp: 0, lvl: 1, hp: 50 }
    items: { itemsEnabled: false, armor: 0, weapon: 0 }
    tasks: {}
    habitIds: []
    dailyIds: []
    todoIds: []
    completedIds: []
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