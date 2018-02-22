db.users.find({}, {todos: 1}).forEach(function (user) {
  _.each(user.todos, function (task) {
    if (moment(task.date).toDate() === 'Invalid Date')
      task.date = moment().format('MM/DD/YYYY');
  });
  db.users.update({_id: user._id}, {$set: {todos: user.todos}});
});