/*
Are there tags applied?
 */

// TODO move to client

export default function appliedTags (userTags, taskTags = []) {
  const arr = userTags.filter(tag => taskTags.indexOf(tag.id) !== -1).map(tag => tag.name);
  return arr.join(', ');
}
