db.users.update(
  {'purchased.plan.customerId': {$ne: null}, 'purchased.plan.dateUpdated': null},
  {
    $set: {'purchased.plan.dateUpdated': new Date('12/01/2014')},
    $unset: {'purchased.plan.datedUpdated': ''},
  },
  {multi: true}
);
