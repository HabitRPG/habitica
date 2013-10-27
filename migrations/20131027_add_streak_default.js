db.users.find().forEach(function(user){
  if (!user.achievements) user.achievements = {streak: 0};
  db.users.update({_id:user._id}, {$set:{'achievements': user.achievements}});
});