let userCount;
userCount = db.users.count(
  {$or:[
    {'purchased.txnCount':{$gt:0},$and:[{'auth.timestamps.loggedin':{$gt:new Date('2017-04-01')}},{'auth.timestamps.loggedin':{$lt:new Date('2017-05-01')}}]},
    {$and:[{'purchased.plan.dateTerminated':{$type:'date'}},{'purchased.plan.dateTerminated':{$gt:new Date('2017-04-01')}},{'purchased.plan.dateTerminated':{$lt:new Date('2017-05-01')}}]}
  ]}
);
print(userCount);
