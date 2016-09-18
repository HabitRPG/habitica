/*
Are there tags applied?
 */

// TODO move to client

module.exports = function appliedTags (userTags, taskTags = []) {
  let arr = userTags.filter(tag => {
    return taskTags.indexOf(tag.id) !== -1;
  }).map(tag => {
    return tag.name;
  });
  return arr.join(', ');
};
