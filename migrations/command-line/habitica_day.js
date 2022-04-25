db.users.updateOne(
  {},
  { $inc: { 'achievements.habiticaDays': 1 } },
  { multi: 1 },
);
