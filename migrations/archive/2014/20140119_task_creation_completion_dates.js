db.users.find({}, {todos: 1, dailys: 1, rewards: 1, habits: 1}).forEach(function (user) {
  _.each(user.habits.concat(user.dailys).concat(user.todos).concat(user.rewards), function (t) {
    t.dateCreated = t.created || new Date();
    delete t.created;
    if (t.type === 'todo' && t.completed) t.dateCompleted = new Date();
  });
  db.users.update({_id: user._id}, {$set: {habits: user.habits, dailys: user.dailys, todos: user.todos, rewards: user.rewards}});
});
