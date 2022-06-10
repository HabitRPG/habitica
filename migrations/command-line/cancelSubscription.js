// mongo habitrpg ./node_modules/moment/moment.js ./migrations/cancelSubscription.js

// For some reason people often to contact me to cancel their sub,
// rather than do it online. Even when I point them to
// the FAQ (https://habitica.fandom.com/wiki/FAQ) they insist...

db.users.update(
  { _id: '' },
  {
    $set: {
      'purchased.plan.dateTerminated': moment().add('month', 1).toDate(),
    },
  },
);
