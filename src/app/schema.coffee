
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
  # removed old update code, dangerous to run twice. 
  # I'm placing db-update code in this function while still in dev, then running
  # once on the server, then removing the code. FIXME figure out something better
  return