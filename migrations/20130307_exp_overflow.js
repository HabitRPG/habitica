// mongo habitrpg ./node_modules/underscore/underscore.js ./migrations/20130307_normalize_algo_values.js

/**
 * Make sure people aren't overflowing their exp with the new system
 */
db.users.find().forEach(function (user) {
  function oldTnl (level) {
    return Math.pow(level, 2) * 10 + level * 10 + 80;
  }

  function newTnl (level) {
    let value = 0;
    if (level >= 100) {
      value = 0;
    } else {
      value = Math.round((Math.pow(level, 2) * 0.25 + 10 * level + 139.75) / 10) * 10; // round to nearest 10
    }
    return value;
  }

  var newTnl = newTnl(user.stats.lvl);
  if (user.stats.exp > newTnl) {
    let percent = user.stats.exp / oldTnl(user.stats.lvl);
    percent = percent > 1 ? 1 : percent;
    user.stats.exp = newTnl * percent;

    try {
      db.users.update(
        {_id: user._id},
        {$set: {'stats.exp': user.stats.exp}},
        {multi: true}
      );
    } catch (e) {
      print(e);
    }
  }
});