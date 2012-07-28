
module.exports.userSchema = userSchema = { 
  stats: { money: 0, exp: 0, lvl: 1, hp: 50 }
  items: { itemsEnabled: false, armor: 0, weapon: 0 }
  tasks: {}
  habitIds: [] 
  dailyIds: [] 
  todoIds: []
  completedIds: [] 
  rewardIds: []
}  
  
module.exports.updateSchema = (model) ->
  # users = model.get('users')
  # console.log _.size(users), 'users.size before'
  # for uid,userObj of users
    # # remove if they don't have a lastCron (older accounts didn't)
    # unless userObj.lastCron?
      # model.del "users.#{uid}"
#    
    # # remove if they haven't logged in in 30 days
    # lastCron = new Date( (new Date(userObj.lastCron)).toDateString() ) # calculate as midnight
    # today = new Date((new Date).toDateString()) # calculate as midnight
    # DAY = 1000 * 60 * 60  * 24
    # daysPassed = Math.floor((today.getTime() - lastCron.getTime()) / DAY)
    # if daysPassed > 30
      # model.del "users.#{uid}"
    
    # TODO  instead of the above, remove all users who's tasks compare directly to require('./content).defaultTasks
