// mongo habitrpg ./node_modules/moment/moment.js ./migrations/current_period_end.js
db.users.updateOne(
  { _id: '' },
  { $set: { 'purchased.plan.dateTerminated': moment().add({ days: 7 }).toDate() } },
);
