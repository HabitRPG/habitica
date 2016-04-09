import _ from 'lodash';

/*
Are there tags applied?
 */

// TODO move to client

module.exports = function appliedTags (userTags, taskTags = {}) {
  let arr = userTags
    .filter(tag => { return taskTags[tag.id]; })
    .map(tag => { return tag.name; });
  return arr.join(', ');
};
