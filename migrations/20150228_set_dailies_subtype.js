// Make sure daily tasks have a subtype, default is daily

db.users.find({}, {dailys: 1}).forEach(function (user) {
  user.dailys.forEach(function (task) {
    task.subtype = 'daily';
  });

  db.users.update({_id: user._id }, {$set: {dailys: user.dailys}});
});
