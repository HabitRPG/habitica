/**
 * Remove duff histories for dailies
 */
// mongo habitrpg ./node_modules/underscore/underscore.js ./migrations/20130307_remove_duff_histories.js
db.users.find().forEach(function (user) {
  _.each(user.tasks, function (task, key) {
    if (task.type === 'daily') {
      // remove busted history entries
      task.history = _.filter(task.history, function (h) {
        return Boolean(h.value);
      });
    }
  });

  try {
    db.users.update(
      {_id: user._id},
      {$set:
                {
                  tasks: user.tasks,
                },
      },
      {multi: true}
    );
  } catch (e) {
    print(e);
  }
});