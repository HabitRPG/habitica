// mongo habitrpg ./node_modules/moment/moment.js ./migrations/freeMonth.js

db.users.update(
  { _id: '' },
  {
    $set: {
      'purchased.plan.customerId': 'temporary',
      'purchased.plan.paymentMethod': 'Stripe',
      'purchased.plan.planId': 'basic_earned',
      'purchased.plan.dateTerminated': moment().add('month', 1).toDate(),
    },
  },
);
// var m = 12;
// db.users.update(
//   {_id:''},
//   {$set:{'purchased.plan':{
//    planId: 'basic_'+m+'mo',
//    paymentMethod: 'Paypal',
//    customerId: 'Gift',
//    dateCreated: new Date(),
//    dateTerminated: moment().add('month',m).toDate(),
//    dateUpdated: new Date(),
//    extraMonths: 0,
//    gemsBought: 0,
//    mysteryItems: [],
//    consecutive: {
//      count: 0,
//      offset: m,
//      gemCapExtra: m/3*5,
//      trinkets: m/3
//    }
//   }}}
// )
