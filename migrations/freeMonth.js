// mongo habitrpg ./node_modules/moment/moment.js ./migrations/freeMonth.js

db.users.update(
  {_id:''},
  {$set:{
    'purchased.plan.customerId':'temporary',
    'purchased.plan.paymentMethod':'Stripe',
    'purchased.plan.planId':'basic_earned',
    'purchased.plan.dateTerminated': moment().add('month',1).toDate()
  }}
)

// db.users.update(
//   {_id:''},
//   {$set:{'purchased.plan':{
// 	  planId: 'basic_3mo',
// 	  paymentMethod: 'Paypal',
// 	  customerId: 'Gift',
// 	  dateCreated: new Date(),
// 	  dateTerminated: moment().add('month',3).toDate()
// 	  dateUpdated: new Date(),
// 	  extraMonths: 0,
// 	  gemsBought: 0,
// 	  mysteryItems: [],
// 	  consecutive: {
// 	    count: 0,
// 	    offset: 3,
// 	    gemCapExtra: 15,
// 	    trinkets: 1
// 	  }
//   }}}
// )