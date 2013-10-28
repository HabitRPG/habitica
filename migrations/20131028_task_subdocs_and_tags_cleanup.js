db.users.find().forEach(function(user){

  // Cleanup broken tags
  _.each(user.tasks, function(task){
    _.each(task.tags, function(val, key){
      _.each(user.tags, function(tag){
        if(key == tag.id) delete task.tags[key];
      });
    });
  });

  // Migrate to TaskSchema subdocs!!
  if (!user.tasks) {
    printjson(user.auth);
    // FIXME before deploying!
  } else {
    _.each(['habit', 'daily', 'todo', 'reward'], function(type) {
      // we use _.transform instead of a simple _.where in order to maintain sort-order
      user[type + "s"] = _.reduce(user[type + "Ids"], function(m, tid) {
        var task = user.tasks[tid];
        if (!task) return m; // remove null tasks
        //if (!user.tasks[tid].tags) user.tasks[tid].tags = {}; // shouldn't be necessary, since TaskSchema.tags has default {}
        task._id = task.id;
        m.push(task);
        return m;
      }, []);
      delete user[type + 'Ids'];
    });
    delete user.tasks;
  }

  try {
    db.users.update({_id:user._id}, user);
  } catch(e) {
    print(e);
  }
});

// Remove old groups.*.challenges, they're not compatible with the new system
db.groups.update({},{$pull:{challenges:1}},{multi:true});
