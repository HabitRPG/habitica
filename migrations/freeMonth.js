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