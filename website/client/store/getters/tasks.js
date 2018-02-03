import { shouldDo } from 'common/script/cron';

// Return all the tags belonging to an user task
export function getTagsFor (store) {
  return (task) => {
    return store.state.user.data.tags
      .filter(tag => task.tags && task.tags.indexOf(tag.id) !== -1)
      .map(tag => tag.name);
  };
}

function getTaskColor (task) {
  if (task.type === 'reward') return 'purple';

  const value = task.value;

  if (value < -20) {
    return 'worst';
  } else if (value < -10) {
    return 'worse';
  } else if (value < -1) {
    return 'bad';
  } else if (value < 1) {
    return 'neutral';
  } else if (value < 5) {
    return 'good';
  } else if (value < 10) {
    return 'better';
  } else {
    return 'best';
  }
}

export function canDelete () {
  return (task) => {
    let isUserChallenge = Boolean(task.userId);
    let activeChallenge = isUserChallenge && task.challenge && task.challenge.id && !task.challenge.broken;
    return !activeChallenge;
  };
}

export function getTaskClasses (store) {
  const userPreferences = store.state.user.data.preferences;

  // Purpose can be one of the following strings:
  // Edit Modal: edit-modal-bg, edit-modal-text, edit-modal-icon
  // Create Modal: create-modal-bg, create-modal-text, create-modal-icon
  // Control: 'control'
  return (task, purpose, dueDate) => {
    if (!dueDate) dueDate = new Date();
    const type = task.type;
    const color = getTaskColor(task);

    switch (purpose) {
      case 'edit-modal-bg':
        return `task-${color}-modal-bg`;
      case 'edit-modal-text':
        return `task-${color}-modal-text`;
      case 'edit-modal-icon':
        return `task-${color}-modal-icon`;
      case 'edit-modal-option-disabled':
        return `task-${color}-modal-option-disabled`;
      case 'edit-modal-habit-control-disabled':
        return `task-${color}-modal-habit-control-disabled`;
      case 'create-modal-bg':
        return 'task-purple-modal-bg';
      case 'create-modal-text':
        return 'task-purple-modal-text';
      case 'create-modal-icon':
        return 'task-purple-modal-icon';
      case 'create-modal-option-disabled':
        return 'task-purple-modal-option-disabled';
      case 'create-modal-habit-control-disabled':
        return 'task-purple-modal-habit-control-disabled';

      case 'control':
        if (type === 'todo' || type === 'daily') {
          if (task.completed || !shouldDo(dueDate, task, userPreferences) && type === 'daily') {
            return {
              bg: 'task-disabled-daily-todo-control-bg',
              checkbox: 'task-disabled-daily-todo-control-checkbox',
              inner: 'task-disabled-daily-todo-control-inner',
              content: 'task-disabled-daily-todo-control-content',
            };
          }

          return {
            bg: `task-${color}-control-bg`,
            checkbox: `task-${color}-control-checkbox`,
            inner: `task-${color}-control-inner-daily-todo`,
          };
        } else if (type === 'reward') {
          return {
            bg: 'task-reward-control-bg',
          };
        } else if (type === 'habit') {
          return {
            up: task.up ?
              { bg: `task-${color}-control-bg`, inner: `task-${color}-control-inner-habit`} :
              { bg: 'task-disabled-habit-control-bg', inner: 'task-disabled-habit-control-inner' },
            down: task.down ?
              { bg: `task-${color}-control-bg`, inner: `task-${color}-control-inner-habit`} :
              { bg: 'task-disabled-habit-control-bg', inner: 'task-disabled-habit-control-inner' },
          };
        }
        break;
      default:
        return 'not a valid class';
    }
  };
}
