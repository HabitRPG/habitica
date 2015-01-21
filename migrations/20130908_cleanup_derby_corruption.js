//mongo habitrpg ./node_modules/lodash/lodash.js migrations/20130908_cleanup_derby_corruption.js

// Racer was notorious for adding duplicates, randomly deleting documents, etc. Once we pull the plug on old.habit,
// run this migration to cleanup all the corruption

db.users.find().forEach(function(user){

  // remove corrupt tasks, which will either be null-value or no id
  user.tasks = _.reduce(user.tasks, function(m,task,k) {
    if (!task || !task.id) return m;
    if (isNaN(+task.value)) task.value = 0;
    m[k] = task;
    return m;
  }, {});

  // fix NaN stats
  _.each(user.stats, function(v,k) {
    if (!v || isNaN(+v)) user.stats[k] = 0;
    return true;
  });

  // remove duplicates, restore ghost tasks
  ['habit', 'daily', 'todo', 'reward'].forEach(function(type) {
    var idList = user[type + "Ids"];
    var taskIds = _.pluck(_.where(user.tasks, {type: type}), 'id');
    var union = _.union(idList, taskIds);
    var preened = _.filter(union, function(id) {
      return id && _.contains(taskIds, id);
    });
    if (!_.isEqual(idList, preened)) {
      user[type + "Ids"] = preened;
    }
  });

  // temporarily remove broken eggs. we'll need to write a migration script to grant gems for and remove these instead
  if (user.items && user.items.eggs) {
    user.items.eggs = _.filter(user.items.eggs,function(egg){
      if (_.isString(egg)) {
        user.balance += 0.75; // give them 3 gems for each broken egg
      } else {
        return true;
      }
    })
  }

  try {
    db.users.update({_id:user._id}, user);
  } catch(e) {
    print(e);
  }
})
