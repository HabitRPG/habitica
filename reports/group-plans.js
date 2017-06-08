// Lists out users who belong to groups with active group plans, with their profile names and email addresses
// mongo habitrpg ./reports/group-plans.js > group-plans.csv

let groupList = [];

db.groups.find({'purchased.plan.customerId':{$exists:true},$or:[{'purchased.plan.dateTerminated':null},{'purchased.plan.dateTerminated':''},{'purchased.plan.dateTerminated':{$gt:new Date()}}]},{'_id':1})
  .forEach(function (group) {
    groupList.push(group._id);
  });

print('name,email');

db.users.find({$or:[{'party._id':{$in:groupList}},{'guilds':{$in:groupList}}]},{'profile.name':1,'auth':1})
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
