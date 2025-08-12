// TODO figure out why this is happening in the first place

db.users.find({}, {habits: 1, dailys: 1, todos: 1, rewards: 1}).forEach(function (user) {
  _.each(user.habits, function (task) {
    task.type = 'habit';
  });
  _.each(user.dailys, function (task) {
    task.type = 'daily';
  });
  _.each(user.todos, function (task) {
    task.type = 'todo';
  });
  _.each(user.rewards, function (task) {
    task.type = 'reward';
  });

  db.users.update({_id: user._id}, {$set: {habits: user.habits, dailys: user.dailys, todos: user.todos, rewards: user.rewards}});
});
