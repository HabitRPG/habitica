
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
  users = model.get('users')
  console.log _.size(users), 'users.size before'
  for uid,userObj of users
    # remove if they don't have a lastCron (older accounts didn't)
    unless userObj.lastCron?
      model.del "users.#{uid}"
   
    # TODO remove all users who's tasks compare directly to require('./content).defaultTasks
    # and haven't logged in for a week
    daysOld = require('./helpers').daysBetween(userObj.lastCron, new Date())
    
    
