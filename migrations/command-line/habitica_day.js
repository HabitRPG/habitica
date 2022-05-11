db.users.updateMany(
  {},
  { $inc: { 'achievements.habiticaDays': 1 } },
);
