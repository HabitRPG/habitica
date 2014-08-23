db.users.find({}).forEach(function(user){
  var newNewMessages = {};

 for(var key in user.newMessages) {
    var val = user.newMessages[key];
    // print("\n" + key + " " + val);
    if(key != "undefined" && val['value']){
      newNewMessages[key] = val;
    }
 }

  db.users.update({_id: user._id}, {$set: {'newMessages': newNewMessages}});
});
