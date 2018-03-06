db.users.update(
  { lastCron: { $exists: false} },
  { $set: { lastCron: Number(new Date()) } },
  { multi: true }
);