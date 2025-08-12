// mongo habitrpg ./node_modules/underscore/underscore.js ./migrations/20130307_normalize_algo_values.js

/**
 * Users were experiencing a lot of extreme Exp multiplication (https://github.com/lefnire/habitrpg/issues/594).
 * This sets things straight, and in preparation for another algorithm overhaul
 */
db.users.find().forEach(function (user) {
  if (user.stats.exp >= 3580) {
    user.stats.exp = 0;
  }

  if (user.stats.lvl > 100) {
    user.stats.lvl = 100;
  }

  _.each(user.tasks, function (task, key) {
    // remove corrupt tasks
    if (!task) {
      delete user.tasks[key];
      return;
    }

    // Fix busted values
    if (task.value > 21.27) {
      task.value = 21.27;
    } else if (task.value < -47.27) {
      task.value = -47.27;
    }
  });

  try {
    db.users.update(
      {_id: user._id},
      {$set:
                {
                  'stats.lvl': user.stats.lvl,
                  'stats.exp': user.stats.exp,
                  tasks: user.tasks,
                },
      },
      {multi: true}
    );
  } catch (e) {
    print(e);
  }
});