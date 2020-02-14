// mongo habitrpg ./node_modules/moment/moment.js ./migrations/current_period_end.js
db.users.update(
  { _id: '' },
  { $set: { 'purchased.plan.dateTerminated': moment().add({ days: 7 }).toDate() } },
);
