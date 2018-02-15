// Migrate all users websites to the profile blurb field
db.users.find({'profile.websites': {$exists: true}}).forEach(function (user) {
  db.users.update({_id: user._id}, {
    $set: {'profile.blurb': `${user.profile.blurb  }\n * ${  user.profile.websites.join('\n * ')}`},
    $unset: {'profile.websites': 1},
  });
});

db.groups.find({'websites.0': {$exists: true}}).forEach(function (group) {
  db.groups.update({_id: group._id}, {
    $set: {description: `${group.description  }\n * ${  group.websites.join('\n * ')}`},
    $unset: {websites: 1},
  });
});
