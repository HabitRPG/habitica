// mongo habitrpg ./node_modules/lodash/lodash.js ./migrations/20131028_task_subdocs_tags_invites.js

db.challenges.find().forEach(function (chal) {
  _.each(chal.habits.concat(chal.dailys).concat(chal.todos).concat(chal.rewards), function (task) {
    task.id = task.id || task._id;
  });
  try {
    db.challenges.update({_id: chal._id}, chal);
    db.groups.update({_id: chal.group}, {$addToSet: {challenges: chal._id}});
  } catch (e) {
    print(e);
  }
});

db.users.find().forEach(function (user) {
  _.each(user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards), function (task) {
    task.id = task.id || task._id;
  });
  try {
    db.users.update({_id: user._id}, user);
  } catch (e) {
    print(e);
  }
});

