db.users.update({'purchased.plan.consecutive.count': NaN}, {$set: {'purchased.plan.consecutive.count': 0}}, {multi: 1});
db.users.update({'purchased.plan.consecutive.offset': NaN}, {$set: {'purchased.plan.consecutive.offset': 0}}, {multi: 1});
db.users.update({'purchased.plan.consecutive.gemCapExtra': NaN}, {$set: {'purchased.plan.consecutive.gemCapExtra': 0}}, {multi: 1});
db.users.update({'purchased.plan.consecutive.trinkets': NaN}, {$set: {'purchased.plan.consecutive.trinkets': 0}}, {multi: 1});