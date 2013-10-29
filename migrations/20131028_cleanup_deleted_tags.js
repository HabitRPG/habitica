db.users.find().forEach(function(user){
  var tags = user.tags;

  _.each(user.tasks, function(task){
    _.each(task.tags, function(val, key){
      _.each(tags, function(tag){
        if(key == tag.id) delete task.tags[key];
      });
    });
  });

  try {
    db.users.update({_id:user._id}, user);
  } catch(e) {
    print(e);
  }
});
