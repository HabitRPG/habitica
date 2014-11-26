// require moment, lodash
db.users.find(
  {'purchased.plan.customerId':{$ne:null}},
  {'purchased.plan':1}
).forEach(function(user){
  var p = user.purchased.plan;
  var latestMonth = p.dateTerminated  || p.dateCreated;
  // TODO is rounding up what we want?
  var consecutiveMonths = Math.ceil(moment(p.dateCreated).diff(latestMonth, 'months', true));
  db.users.update({_id: user._id}, {$set: {'purchased.plan.consecutiveMonths': consecutiveMonths}});
});
