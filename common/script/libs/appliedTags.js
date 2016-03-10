import _ from 'lodash';

/*
Are there tags applied?
 */

module.exports = function(userTags, taskTags) {
  var arr;
  arr = [];
  _.each(userTags, function(t) {
    if (t == null) {
      return;
    }
    if (taskTags != null ? taskTags[t.id] : void 0) {
      return arr.push(t.name);
    }
  });
  return arr.join(', ');
};
