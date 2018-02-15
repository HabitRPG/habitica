let _ = require('lodash');

db.users.find({}).forEach(function (user) {
  let newNewMessages = {};

  _.each(user.newMessages, function (val, key) {
    if (key != 'undefined') {
      newNewMessages[key] = val;
    }
  });

  db.users.update({_id: user._id}, {$set: {newMessages: newNewMessages}});
});
