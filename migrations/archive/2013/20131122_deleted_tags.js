// Cleanup broken tags
// -------------------------
db.users.find().forEach(function (user) {
  let tasks = user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards);

  _.each(tasks, function (task) {
    _.each(task.tags, function (value, key) { // value is true, key is tag.id
      if (!_.find(user.tags, {id: key})) delete task.tags[key];
    });
  });

  db.users.update({_id: user._id}, user);
});