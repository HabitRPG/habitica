
module.exports.userSchema = userSchema = {
  balance: 2
  stats: { money: 0, exp: 0, lvl: 1, hp: 50 }
  items: { itemsEnabled: false, armor: 0, weapon: 0, rerollsRemaining: 5 }
  tasks: {}
  habitIds: [] 
  dailyIds: [] 
  todoIds: []
  completedIds: [] 
  rewardIds: []
}  
  
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
      daysOld = require('./helpers').daysBetween(userObj.lastCron, new Date())
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
