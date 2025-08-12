db.users.find().forEach(function (user) {
  if (!user.purchased) user.purchased = {hair: {}, skin: {}};
  user.purchased.ads = user.flags && Boolean(user.flags.ads);
  db.users.update({_id: user._id}, {$set: {purchased: user.purchased, 'flags.newStuff': true}, $unset: {'flags.ads': 1}});
});