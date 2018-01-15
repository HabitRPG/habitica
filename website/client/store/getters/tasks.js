import { shouldDo } from 'common/script/cron';

import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';

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

// Task filter data
// @TODO find a way to include user preferences w.r.t sort and defaults
const taskFilters = {
  habit: {
    filters: [
      { label: 'all', filterFn: () => true },
      { label: 'yellowred', filterFn: t => t.value < 1 }, // weak
      { label: 'greenblue', filterFn: t => t.value >= 1 }, // strong
    ],
  },
  daily: {
    filters: [
      { label: 'all', filterFn: () => true },
      { label: 'due', filterFn: t => !t.completed && shouldDo(new Date(), t, this.userPreferences) },
      { label: 'notDue', filterFn: t => t.completed || !shouldDo(new Date(), t, this.userPreferences) },
    ],
  },
  todo: {
    filters: [
      { label: 'remaining', filterFn: t => !t.completed }, // active
      { label: 'scheduled', filterFn: t => !t.completed && t.date, sort: t => t.date },
      { label: 'complete2', filterFn: t => t.completed },
    ],
  },
  reward: {
    filters: [
      { label: 'all', filterFn: () => true },
      { label: 'custom', filterFn: () => true }, // all rewards made by the user
      { label: 'wishlist', filterFn: () => false }, // not user tasks
    ],
  },
};

// @TODO: sort task list based on used preferences
export function getTaskList (store) {
  return ({ type, filterType = {}, tagList = [], searchText = null, override = [] }) => {
    // get requested tasks
    // check if task list has been passed as override props
    // assumption: type will always be passed as param
    let requestedTasks = isEmpty(override) ?
      store.state.tasks.data[`${type}s`] :
      override;

    // filter requested tasks by filter type
    if (!isEmpty(filterType)) {
      let [selectedFilter] = taskFilters[type].filters.filter(f => f.label === filterType.label);
      // @TODO find a way (probably thru currying) to implicitly pass user preference data to task filters
      requestedTasks = requestedTasks.filter(selectedFilter.filterFn);
      if (selectedFilter.sort) {
        requestedTasks = sortBy(requestedTasks, selectedFilter.sort);
      }
    }

    // fitler requested tasks by tags
    if (!isEmpty(tagList)) {
      requestedTasks = requestedTasks.filter(
        task => tagList.every(tag => task.tags.indexOf(tag) !== -1)
      );
    }

    // filter requested tasks by search text
    if (!isEmpty(searchText)) {
      // to ensure broadest case insensitive search matching
      let searchTextLowerCase = searchText.toLowerCase();
      requestedTasks = requestedTasks.filter(
        task => {
          // eslint rule disabled for block to allow nested binary expression
          /* eslint-disable no-extra-parens */
          return (
            (!isEmpty(task.text) && task.text.toLowerCase().indexOf(searchTextLowerCase) > -1) ||
            (!isEmpty(task.note) && task.note.toLowerCase().indexOf(searchTextLowerCase) > -1) ||
            (!isEmpty(task.checklist) && task.checklist.length > 0 &&
              task.checklist.some(checkItem => checkItem.text.toLowerCase().indexOf(searchTextLowerCase) > -1))
          );
          /* eslint-enable no-extra-parens */
        });
    }

    // eslint-disable-next-line no-console
    // console.log('task:getters:getTaskList', requestedTasks);

    return requestedTasks;
  };
}
