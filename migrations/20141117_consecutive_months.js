// require moment, lodash
db.users.find(
  {'purchased.plan.customerId':{$ne:null}},
  {_id:1, 'purchased.plan':1}
).forEach(function(user){
  var p = user.purchased.plan
    , latestMonth = p.dateTerminated  || new Date() // their last sub date, or on-going (now)
    , count = moment(latestMonth).diff(p.dateCreated, 'months');
  db.users.update({_id: user._id}, {$set: {
    'purchased.plan.consecutive.count': count,
    'purchased.plan.consecutive.gemCapExtra': _.min([ Math.floor(count/3)*5, 25 ]),
    'purchased.plan.consecutive.trinkets': Math.floor(count/3)
  }});
});
