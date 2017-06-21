// Return all the tags belonging to an user task
export function getTagsFor (store) {
  return (task) => store.state.user.data.tags
    .filter(tag => task.tags.indexOf(tag.id) !== -1)
    .map(tag => tag.name);
}

export function getColorClassFor () {
  return (task, {isNew, isEditing, isControlArea} = {}) => {
    const value = task.value;
    let color = 'task-color-';

    if (isNew && isEditing) {
      color += 'purple';
      return color;
    } else if (task.type === 'reward') {
      color += isEditing ? 'purple' : 'reward';
      return color;
    } else if (value < -20) {
      color += 'worst';
    } else if (value < -10) {
      color += 'worse';
    } else if (value < -1) {
      color += 'bad';
    } else if (value < 1) {
      color += 'neutral';
    } else if (value < 5) {
      color += 'good';
    } else if (value < 10) {
      color += 'better';
    } else {
      color += 'best';
    }

    if (isControlArea) color += '-control';

    return color;
  };
}