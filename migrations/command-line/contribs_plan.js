// Give contrib.level 7+ free subscription for life
db.users.update(
  {
    'contributor.level': { $gte: 7 },
    'purchased.plan.customerId': null,
  },

  {
    $set: {
      'purchased.plan': {
        planId: 'basic',
        customerId: 'habitrpg',
        dateCreated: new Date(),
        dateUpdated: new Date(),
        gemsBought: 0,
      },
    },
  },

  { multi: true },

);
