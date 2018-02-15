// mongo habitrpg ./node_modules/lodash/lodash.js migrations/20130908_cleanup_corrupt_tags.js

// Racer was notorious for adding duplicates, randomly deleting documents, etc. Once we pull the plug on old.habit,
// run this migration to cleanup all the corruption

db.users.find().forEach(function (user) {
  user.tags = _.filter(user.tags, function (t) {
    return t ? t.id : false;
  });

  try {
    db.users.update({_id: user._id}, {$set: {tags: user.tags}});
  } catch (e) {
    print(e);
  }
});
