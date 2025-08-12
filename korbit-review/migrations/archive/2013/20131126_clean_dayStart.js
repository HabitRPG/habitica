db.users.find({'preferences.dayStart': {$exists: 1}}, {'preferences.dayStart': 1}).forEach(function (user) {
  let dayStart = Number(user.preferences.dayStart);
  dayStart = _.isNaN(dayStart) || dayStart < 0 || dayStart > 24 ? 0 : dayStart;
  db.users.update({_id: user._id}, {$set: {'preferences.dayStart': dayStart}});
});
