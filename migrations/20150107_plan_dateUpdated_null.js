db.users.update(
  {'purchased.plan.customerId':{$ne:null}, 'purchased.plan.dateUpdated':null},
  {$set: {'purchased.plan.datedUpdated': new Date('12/01/2014')}},
  {multi:true}
);