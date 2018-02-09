// CSV report of active group plans with owner info
// mongo habitrpg /reports/group-plan-owners.js > group-plan-owners.csv

print('Group ID,User ID,Profile Name,Email');
var groupsCursor = db.groups.find(
  {
    'purchased.plan.planId': {$type: 2},
    'purchased.plan.owner':  {$type: 2},
    $or: [
      {'purchased.plan.dateTerminated': {$gt: new Date()}},
      {$and: [
        {'purchased.plan.dateTerminated': {$exists: true}},
        {'purchased.plan.dateTerminated': {$not: {$type: 9}}},
      ]},
    ],
  },
  {'purchased.plan.owner': 1,
  'purchased.plan.dateCreated': 1}
);

while (groupsCursor.hasNext()) {
  var group = groupsCursor.next();
  var userCursor = db.users.find(
    {'_id': group.purchased.plan.owner, 'auth': {$exists: true}},
    {'auth.local.email': 1, 'auth.facebook.emails': 1, 'auth.google.emails': 1, 'profile.name': 1}
  );
  var email = 'None';

  while (userCursor.hasNext()) {
    var user = userCursor.next();
    var auth = user.auth;

    if (auth.local && auth.local.email) {
      email = auth.local.email;
    } else if (auth.facebook && auth.facebook.emails && auth.facebook.emails[0] && auth.facebook.emails[0].value) {
      email = auth.facebook.emails[0].value;
    } else if (auth.google && auth.google.emails && auth.google.emails[0] && auth.google.emails[0].value) {
      email = auth.google.emails[0].value;
    }
  }

  print(group._id + ',' + user._id + ',"' + user.profile.name + '",' + email);
}
