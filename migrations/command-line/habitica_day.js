db.users.update(
  {},
  { $inc: { 'achievements.habiticaDays': 1 } },
  { multi: 1 },
);
