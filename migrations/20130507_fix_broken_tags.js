/**
 * users getting broken tags when they try to edit the first blank tag on accident
 *
 * mongo habitrpg ./node_modules/underscore/underscore.js ./migrations/20130507_fix_broken_tags.js
 */

db.users.find().forEach(function (user) {
  if (!_.isArray(user.tags)) {
    db.users.update({_id: user._id}, {$set: {tags: []}});
  }
});