// Return all the tags belonging to an user task
export function getTagsFor (store) {
  return (task) => store.state.user.data.tags
    .filter(tag => task.tags.indexOf(tag.id) !== -1)
    .map(tag => tag.name);
}