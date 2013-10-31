// mongo habitrpg ./node_modules/lodash/lodash.js ./migrations/20131028_task_subdocs_tags_invites.js

// TODO it might be better we just find() and save() all user objects using mongoose, and rely on our defined pre('save')
// and default values to "migrate" users. This way we can make sure those parts are working properly too
// @see http://stackoverflow.com/questions/14867697/mongoose-full-collection-scan
//Also, what do we think of a Mongoose Migration module? something like https://github.com/madhums/mongoose-migrate

db.users.find().forEach(function(user){

  // Add invites to groups
  // -------------------------
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
  // -------------------------
  _.each(user.tasks, function(task){
    _.each(task.tags, function(val, key){
      _.each(user.tags, function(tag){
        if(key == tag.id) delete task.tags[key];
      });
    });
  });

  // Fix corrupt dates
  // -------------------------
  user.lastCron = new Date(user.lastCron);
  if (user.lastCron == 'Invalid Date') user.lastCron = new Date();
  if (user.auth) { // what to do with !auth?
    _.defaults(user.auth, {timestamps: {created:undefined, loggedin: undefined}});
    _.defaults(user.auth.timestamps, {created: new Date(user.lastCron), loggedin: new Date(user.lastCron)});
  }

  // Add username
  // -------------------------
  if (!user.profile) user.profile = {name:undefined};
  if (_.isEmpty(user.profile.name) && user.auth) {
    var fb = user.auth.facebook;
    user.profile.name =
      (user.auth.local && user.auth.local.username) ||
        (fb && (fb.displayName || fb.name || fb.username || (fb.first_name && fb.first_name + ' ' + fb.last_name))) ||
        'Anonymous';
  }

  // Migrate to TaskSchema Sub-Docs!
  // -------------------------
  if (!user.tasks) {
    // So evidentaly users before 02/2013 were ALREADY setup based on habits[], dailys[], etcs... I don't remember our schema
    // ever being that way... Anyway, print busted users here (they don't have tasks, but also don't have the right schema)
    if (!user.habits || !user.dailys || !user.todos || !user.rewards) {
      print(user._id);
    }
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

// Remove old groups.*.challenges, they're not compatible with the new system, set member counts
// -------------------------
db.groups.find().forEach(function(group){
  db.groups.update({_id:group._id}, {
    $set:{memberCount: _.size(group.members)},
    $pull:{challenges:1}
  })
});

// HabitRPG => Tavern
// -------------------------
db.groups.update({_id:'habitrpg'}, {$set:{name:'Tavern'}});