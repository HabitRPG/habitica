content = require './content'
moment = require 'moment'
_ = require 'underscore'

userSchema = {
  balance: 2
  stats: { money: 0, exp: 0, lvl: 1, hp: 50 }
  items: { itemsEnabled: false, armor: 0, weapon: 0 }
  tasks: {}
  habitIds: [] 
  dailyIds: [] 
  todoIds: []
  completedIds: [] 
  rewardIds: []
}  

module.exports.newUserObject = ->
  # deep clone, else further new users get duplicate objects
  newUser = require('clone')(userSchema, true) #deep
  for task in content.defaultTasks
    guid = task.id = require('racer').uuid()
    newUser.tasks[guid] = task
    switch task.type
      when 'habit' then newUser.habitIds.push guid
      when 'daily' then newUser.dailyIds.push guid
      when 'todo' then newUser.todoIds.push guid
      when 'reward' then newUser.rewardIds.push guid
  return newUser
  
module.exports.updateSchema = (model) ->
  return # not using, will revisit this later
  # Reset history, remove inactive users
  model.fetch 'users', (err, users) ->
    _.each users.get(), (userObj) ->
      userPath = "users.#{userObj._id}"
      user = model.at(userPath)
      
      # Remove inactive users
      # remove if they don't have a lastCron (older accounts didn't)
      unless userObj.lastCron?
        model.del(userPath)
        return
             
      # Remove all users who haven't logged in for a month
      daysOld = helpers.daysBetween(new Date(), userObj.lastCron)
      if daysOld > 30
        # and who have mostly the default tasks
        sameTasks = _.filter require('./content').defaultTasks, (defaultTask) ->
          foundSame = _.find userObj.tasks, (userTask) ->
            userTask.text == defaultTask.text
          return foundSame?
        if _.size(sameTasks)>5
          model.del(userPath)
          return
      
      # Reset all history
      user.set 'history', {exp:[], todos:[]}
      _.each userObj.tasks, (taskObj) ->
        task = user.at "tasks.#{taskObj.id}"
        if task.get("history")
          task.set "history", []
