db.users.update(
    { lastCron: { $exists: false} },
    { $set: { lastCron: +new Date } },
    { multi: true }
);