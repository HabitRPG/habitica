import dotSet from '../libs/dotSet';

/*
This allows you to set object properties by dot-path. Eg, you can run pathSet('stats.hp',50,user) which is the same as
user.stats.hp = 50. This is useful because in our habitrpg-shared functions we're returning changesets as {path:value},
so that different consumers can implement setters their own way. Derby needs model.set(path, value) for example, where
Angular sets object properties directly - in which case, this function will be used.
 */

module.exports = function(user, path, val) {
  return dotSet(user, path, val);
};
