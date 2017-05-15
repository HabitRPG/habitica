// Lists out users who are leaders of groups with expired group plans, with their profile names and email addresses
// mongo habitrpg ./reports/expired-group-plans.js > expired-group-plans.csv

let userList = [];

db.groups.find({'purchased.plan.customerId':{$exists:true},$and:[{'purchased.plan.dateTerminated':{$type:'date'}},{'purchased.plan.dateTerminated':{$lt:new Date()}}]},{'purchased.plan':1})
  .forEach(function (group) {
    userList.push(group.purchased.plan.owner);
  });

print('name,email');

db.users.find({'_id':{$in:userList}},{'profile.name':1,'auth':1})
  .forEach(function (user) {
    if (!user || !user.auth) return;
    let email;
    if (user.auth.local && user.auth.local.email) {
      email = user.auth.local.email;
    } else if (user.auth.facebook && user.auth.facebook.emails && user.auth.facebook.emails[0].value) {
      email = user.auth.facebook.emails[0].value;
    } else if (user.auth.google && user.auth.google.emails && user.auth.google.emails[0].value) {
      email = user.auth.google.emails[0].value;
    } else {
      email = 'none';
    }
    print('\"' + user.profile.name + '\"' + ',' + '\"' + email + '\"');
  });
