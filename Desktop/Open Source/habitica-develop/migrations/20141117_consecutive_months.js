// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

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
