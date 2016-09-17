import _ from 'lodash';

/*
 This allows you to set object properties by dot-path. Eg, you can run pathSet('stats.hp',50,user) which is the same as
 user.stats.hp = 50. This is useful because in our habitrpg-shared functions we're returning changesets as {path:value},
 so that different consumers can implement setters their own way. Derby needs model.set(path, value) for example, where
 Angular sets object properties directly - in which case, this function will be used.
*/

// TODO use directly _.set and remove this fn, only used in client

module.exports = function dotSet (user, path, val) {
  return _.set(user, path, val);
};
