db.users.find({
  $or: [
    {'backer.admin': {$exists: 1}},
    {'backer.contributor': {$exists: 1}},
  ],
}, {backer: 1}).forEach(function (user) {
  user.contributor = {};
  user.contributor.admin = user.backer.admin;
  delete user.backer.admin;

  // this isnt' the proper storage format, but I'm going to be going through the admin utility manually and setting things properly
  if (user.backer.contributor) {
    user.contributor.text = user.backer.contributor;
    delete user.backer.contributor;
  }

  db.users.update({_id: user._id}, {$set: {backer: user.backer, contributor: user.contributor}});
});