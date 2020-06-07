import sortBy from 'lodash/sortBy';
import { shouldDo } from '@/../../common/script/cron';

// Library / Utility function
import { orderSingleTypeTasks } from '@/libs/store/helpers/orderTasks';
import { getActiveFilter } from '@/libs/store/helpers/filterTasks';


// Return all the tags belonging to an user task
export function getTagsFor (store) {
  return task => store.state.user.data.tags
    .filter(tag => task.tags && task.tags.indexOf(tag.id) !== -1)
    .map(tag => tag.name);
}

function getTaskColor (task) {
  if (task.type === 'reward' || task.byHabitica) return 'purple';

  const { value } = task;

  if (value < -20) {
    return 'worst';
  } if (value < -10) {
    return 'worse';
  } if (value < -1) {
    return 'bad';
  } if (value < 1) {
    return 'neutral';
  } if (value < 5) {
    return 'good';
  } if (value < 10) {
    return 'better';
  }
  return 'best';
}

export function canDelete (store) {
  return (task, taskCategory, onUserDashboard, group, challenge) => {
    const user = store.state.user.data;
    const userId = user.id || user._id;

    const isUserAdmin = user.contributor && !!user.contributor.admin;
    const isUserGroupLeader = group && (group.leader
      && group.leader._id === userId);
    const isUserGroupManager = group && (group.managers
        && Boolean(group.managers[userId]));
    const isUserChallenge = userId === (challenge
      && challenge.leader !== null && challenge.leader.id);

    let isUserCanDeleteTask = onUserDashboard;

    switch (taskCategory) {
      case 'challenge':
        if (!onUserDashboard) {
          isUserCanDeleteTask = isUserChallenge || isUserAdmin;
        } else {
          isUserCanDeleteTask = isUserAdmin;
        }
        break;
      case 'group':
        if (!onUserDashboard) {
          isUserCanDeleteTask = isUserGroupLeader || isUserGroupManager || isUserAdmin;
        } else {
          isUserCanDeleteTask = isUserAdmin;
        }
        break;
      default:
        break;
    }
    return Boolean(isUserCanDeleteTask);
  };
}

export function canEdit (store) {
  return (task, taskCategory, onUserDashboard, group, challenge) => {
    let isUserCanEditTask = onUserDashboard;
    const user = store.state.user.data;
    const userId = user.id || user._id;

    const isUserAdmin = user.contributor && !!user.contributor.admin;
    const isUserGroupLeader = group && (group.leader
      && group.leader._id === userId);
    const isUserGroupManager = group && (group.managers
        && Boolean(group.managers[userId]));
    const isUserChallenge = userId === (challenge
      && challenge.leader !== null && challenge.leader.id);


    switch (taskCategory) {
      case 'challenge':
        if (!onUserDashboard) {
          isUserCanEditTask = isUserChallenge || isUserAdmin;
        } else {
          isUserCanEditTask = true;
        }
        break;
      case 'group':
        if (!onUserDashboard) {
          isUserCanEditTask = isUserGroupLeader || isUserGroupManager || isUserAdmin;
        } else {
          isUserCanEditTask = true;
        }
        break;
      default:
        break;
    }
    return Boolean(isUserCanEditTask);
  };
}

export function getTaskClasses (store) {
  const userPreferences = store.state.user.data.preferences;

  // Purpose can be one of the following strings:
  // Edit Modal: edit-modal-bg, edit-modal-text, edit-modal-icon
  // Create Modal: create-modal-bg, create-modal-text, create-modal-icon
  // Control: 'control'
  return (task, purpose, dueDate) => {
    if (!dueDate) dueDate = new Date(); // eslint-disable-line no-param-reassign
    const { type } = task;
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
          if (task.completed || (!shouldDo(dueDate, task, userPreferences) && type === 'daily')) {
            return {
              bg: 'task-disabled-daily-todo-control-bg',
              checkbox: 'task-disabled-daily-todo-control-checkbox',
              inner: 'task-disabled-daily-todo-control-inner',
              content: 'task-disabled-daily-todo-control-content',
            };
          }

          return {
            bg: task.group && task.group.id && !task.userId ? `task-${color}-control-bg-noninteractive` : `task-${color}-control-bg`,
            checkbox: `task-${color}-control-checkbox`,
            inner: `task-${color}-control-inner-daily-todo`,
            icon: `task-${color}-control-icon`,
          };
        } if (type === 'reward') {
          return {
            bg: task.group && task.group.id && !task.userId ? 'task-reward-control-bg-noninteractive' : 'task-reward-control-bg',
          };
        } if (type === 'habit') {
          return {
            up: task.up
              ? { bg: task.group && task.group.id && !task.userId ? `task-${color}-control-bg-noninteractive` : `task-${color}-control-bg`, inner: `task-${color}-control-inner-habit`, icon: `task-${color}-control-icon` }
              : { bg: 'task-disabled-habit-control-bg', inner: 'task-disabled-habit-control-inner', icon: `task-${color}-control-icon` },
            down: task.down
              ? { bg: task.group && task.group.id && !task.userId ? `task-${color}-control-bg-noninteractive` : `task-${color}-control-bg`, inner: `task-${color}-control-inner-habit`, icon: `task-${color}-control-icon` }
              : { bg: 'task-disabled-habit-control-bg', inner: 'task-disabled-habit-control-inner', icon: `task-${color}-control-icon` },
          };
        }
        return null;
      default:
        return 'not a valid class';
    }
  };
}

// Returns all list for given task type
export function getUnfilteredTaskList ({ state }) {
  return type => state.tasks.data[`${type}s`];
}

// Returns filtered, sorted, ordered, tag filtered, and search filtered task list
// @TODO: sort task list based on used preferences
export function getFilteredTaskList ({ state, getters }) {
  return ({
    type,
    filterType = '',
  }) => {
    // get requested tasks
    // check if task list has been passed as override props
    // assumption: type will always be passed as param
    let requestedTasks = getters['tasks:getUnfilteredTaskList'](type);

    const userPreferences = state.user.data.preferences;
    const taskOrderForType = state.user.data.tasksOrder[type];

    // order tasks based on user set task order
    // Still needs unit test for this..
    if (requestedTasks.length > 0 && ['scheduled', 'due'].indexOf(filterType.label) === -1) {
      requestedTasks = orderSingleTypeTasks(requestedTasks, taskOrderForType);
    }

    let selectedFilter = getActiveFilter(type, filterType);
    // Pass user preferences to the filter function which uses currying
    if (type === 'daily' && (filterType === 'due' || filterType === 'notDue')) {
      selectedFilter = {
        ...selectedFilter,
        filterFn: selectedFilter.filterFn(userPreferences),
      };
    }

    requestedTasks = requestedTasks.filter(selectedFilter.filterFn);
    if (selectedFilter.sort) {
      requestedTasks = sortBy(requestedTasks, selectedFilter.sort);
    }

    return requestedTasks;
  };
}
