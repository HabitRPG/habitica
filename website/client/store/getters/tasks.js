import { shouldDo } from 'common/script/cron';

// Return all the tags belonging to an user task
export function getTagsFor (store) {
  return (task) => store.state.user.data.tags
    .filter(tag => task.tags.indexOf(tag.id) !== -1)
    .map(tag => tag.name);
}

function getTaskColorByValue (value) {
  if (value < -20) {
    return 'task-worst';
  } else if (value < -10) {
    return 'task-worse';
  } else if (value < -1) {
    return 'task-bad';
  } else if (value < 1) {
    return 'task-neutral';
  } else if (value < 5) {
    return 'task-good';
  } else if (value < 10) {
    return 'task-better';
  } else {
    return 'task-best';
  }
}

export function getTaskClasses (store) {
  const userPreferences = store.state.user.data.preferences;

  // Purpose is one of 'controls', 'editModal', 'createModal', 'content'
  return (task, purpose) => {
    const type = task.type;

    switch (purpose) {
      case 'createModal':
        return 'task-purple';
      case 'editModal':
        return type === 'reward' ? 'task-purple' : getTaskColorByValue(task.value);
      case 'control':
        switch (type) {
          case 'daily':
            if (task.completed || !shouldDo(new Date(), task, userPreferences)) return 'task-daily-todo-disabled';
            return getTaskColorByValue(task.value);
          case 'todo':
            if (task.completed) return 'task-daily-todo-disabled';
            return getTaskColorByValue(task.value);
          case 'habit':
            return {
              up: task.up ? getTaskColorByValue(task.value) : 'task-habit-disabled',
              down: task.down ? getTaskColorByValue(task.value) : 'task-habit-disabled',
            };
          case 'reward':
            return 'task-reward';
        }
        break;
      case 'content':
        if (type === 'daily' && (task.completed || !task.isDue) || type === 'todo' && task.completed) {
          return 'task-daily-todo-content-disabled';
        }
        break;
    }
  };
}