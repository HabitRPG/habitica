function deleteId (h) {
  delete h._id;
}

db.users.find({}, {habits: 1, dailys: 1, history: 1}).forEach(function (user) {
  if (user.history) {
    _.each(['todos', 'exp'], function (type) {
      if (user.history[type]) {
        _.each(user.history.exp, deleteId);
      }
    });
  } else {
    user.history = {exp: [], todos: []};
  }

  _.each(['habits', 'dailys'], function (type) {
    _.each(user[type].history, deleteId);
  });

  db.users.update({_id: user._id}, {$set: {history: user.history, habits: user.habits, dailys: user.dailys}});
});