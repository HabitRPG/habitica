
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
  for uid,userObj of model.get('users')
    user = model.at("users.#{uid}")
    
    user.set 'completedIds', []

    # schema = jQuery.extend(true, {}, userSchema)
    # # add to schema if user doesn't have these elements
    # _.each schema, (val,key) ->
      # user.set(key,val) unless user.get(key) 
  
    # _todoList <-> _completedList transfering code update
    completedIds = user.get('completedIds')
    todoIds = user.get('todoIds')
    for id,task of user.get('tasks')
      if task.type=='todo' and task.completed==true
        # if in todoList but shouldn't be, remove it
        if (index = todoIds.indexOf(id)) != -1
          todoIds.splice(index, 1)
        # if not in completedList but should be, add it
        if (index = completedIds.indexOf(id)) == -1   
          completedIds.push id
    user.set 'todoIds', todoIds
    user.set 'completedIds', completedIds