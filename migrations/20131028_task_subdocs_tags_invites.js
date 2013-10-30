var groups = {};

db.users.find().forEach(function(user){

  // add_invites_to_groups
  if(user.invitations){
    if(user.invitations.party){
      db.groups.update({_id: user.invitations.party.id}, {$addToSet:{invites:user._id}});
    }

    if(user.invitations.guilds){
      _.each(user.invitations.guilds, function(guild){
        db.groups.update({_id: guild.id}, {$addToSet:{invites:user._id}});
      });
    }
  }

  // Cleanup broken tags
  _.each(user.tasks, function(task){
    _.each(task.tags, function(val, key){
      _.each(user.tags, function(tag){
        if(key == tag.id) delete task.tags[key];
      });
    });
  });

  // Add username
  if (_.isEmpty(user.profile.name)) {
    var fb = user.auth.facebook;
    user.profile.name =
      (user.auth.local && user.auth.local.username) ||
        (fb && (fb.displayName || fb.name || fb.username || (fb.first_name && fb.first_name + ' ' + fb.last_name))) ||
        'Anonymous';
  }

  // Migrate to TaskSchema subdocs!!
  if (!user.tasks) {
    // FIXME before deploying!
    print(user._id);
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
// set member counts
db.groups.find().forEach(function(group){
  db.groups.update({_id:group._id}, {
    $set:{memberCount: _.size(group.members)},
    $pull:{challenges:1}
  })
});

// HabitRPG => Tavern
db.groups.update({_id:'habitrpg'}, {$set:{name:'Tavern'}});