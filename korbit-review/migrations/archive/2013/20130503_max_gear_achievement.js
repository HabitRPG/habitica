/**
 * For users who already have max gear, they earned the achievement
 */
// mongo habitrpg ./node_modules/underscore/underscore.js ./migrations/20130503_max_gear_achievement.js
db.users.find().forEach(function (user) {
  let items = user.items;
  if (!items) {
    return;
  }
  if (parseInt(items.armor) === 5 &&
         parseInt(items.head) === 5 &&
         parseInt(items.shield) === 5 &&
         parseInt(items.weapon) === 6) {
    try {
      db.users.update(
        {_id: user._id},
        {$set: {'achievements.ultimateGear': true}}
      );
    } catch (e) {
      print(e);
    }
  }
});