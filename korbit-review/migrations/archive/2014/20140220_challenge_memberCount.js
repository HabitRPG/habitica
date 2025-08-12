db.challenges.find({}, {members: 1}).forEach(function (chal) {
  db.challenges.update({_id: chal._id}, {$set: {memberCount: chal.members.length}});
});
