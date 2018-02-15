// This migration has already been run in the past. It's vital to fix these users presently, but we need to find
// out why task values are ever getting in as NaN. My guess is API PUT /tasks/:tid routes
db.users.find({}, {habits: 1, dailys: 1, todos: 1, rewards: 1}).forEach(function (user) {
  _.each(['habits', 'dailys', 'todos', 'rewards'], function (type) {
    _.each(user[type], function (task) {
      task.value = Number(task.value);
      if (_.isNaN(task.value)) {
        task.value = 0;
        print(user._id);
      }
    });
  });

  db.users.update({_id: user._id}, {$set: {habits: user.habits, dailys: user.dailys, todos: user.todos, rewards: user.rewards}});
});