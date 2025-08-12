// Increase everyone's gems per their contribution level
db.users.find({'contributor.level': {$gt: 0}}, {contributor: 1, balance: 1}).forEach(function (user) {
  db.users.update({_id: user._id}, {$inc: {balance: user.contributor.level * 0.5} });
});