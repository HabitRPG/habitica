import { shouldDo } from '@/../../common/script/cron';

// Library / Utility function
import { orderSingleTypeTasks } from '@/libs/store/helpers/orderTasks';
import { getActiveFilter, sortAndFilterTasks } from '@/libs/store/helpers/filterTasks';

// Return all the tags belonging to an user task
export function getTagsFor (store) {
  return task => store.state.user.data.tags
    .filter(tag => task.tags && task.tags.indexOf(tag.id) !== -1)
    .map(tag => tag.name);
}

export function getTagsByIdList (store) {
  return function tagsByIdListFunc (taskIdArray) {
    return (taskIdArray || []).length > 0
      ? store.state.user.data.tags
        .filter(tag => taskIdArray.indexOf(tag.id) !== -1)
      : [];
  };
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

    const isUserAdmin = user.permissions && user.permissions.challengeAdmin;
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

    const isUserAdmin = user.permissions
      && (user.permissions.challengeAdmin || user.permissions.fullAccess);
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
        isUserCanEditTask = isUserGroupLeader || isUserGroupManager;
        break;
      default:
        break;
    }
    return Boolean(isUserCanEditTask);
  };
}

function _nonInteractive (task, userId) {
  if (task.userId) return false;
  if (task.challenge && task.challenge.id) return true;
  if (
    task.group && task.group.assignedUsers
    && task.group.assignedUsers.length > 0
    && task.group.assignedUsers.indexOf(userId) === -1
  ) return true;
  return false;
}

export function getTaskClasses (store) {
  const userPreferences = store.state.user.data.preferences;
  const userId = store.state.user.data._id;

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
      case 'edit-modal-content':
        return `task-${color}-modal-content`;
      case 'create-modal-content':
        return 'task-purple-modal-content';
      case 'edit-modal-headings':
        return `task-${color}-modal-headings`;
      case 'edit-modal-text':
        return `task-${color}-modal-text`;
      case 'edit-modal-icon':
        return `task-${color}-modal-icon`;
      case 'edit-modal-input':
        return `task-${color}-modal-text task-${color}-modal-input`;
      case 'edit-modal-option-disabled':
        return `task-${color}-modal-option-disabled`;
      case 'edit-modal-habit-control-disabled':
        return `task-${color}-modal-habit-control-disabled`;
      case 'create-modal-bg':
        return 'task-purple-modal-bg';
      case 'create-modal-headings':
        return 'task-purple-modal-headings';
      case 'create-modal-text':
        return 'task-purple-modal-text';
      case 'create-modal-input':
        return 'task-purple-modal-text task-purple-modal-input';
      case 'create-modal-icon':
        return 'task-purple-modal-icon';
      case 'create-modal-option-disabled':
        return 'task-purple-modal-option-disabled';
      case 'create-modal-habit-control-disabled':
        return 'task-purple-modal-habit-control-disabled';

      case 'control':
        if (type === 'todo' || type === 'daily') {
          if (task.completed
            || (!shouldDo(dueDate, task, userPreferences) && type === 'daily')
            || (task.group && task.group.assignedUsersDetail
              && task.group.assignedUsersDetail[userId]
              && task.group.assignedUsersDetail[userId].completed)
          ) {
            return {
              bg: _nonInteractive(task, userId) ? 'task-disabled-daily-todo-control-bg-noninteractive' : 'task-disabled-daily-todo-control-bg',
              checkbox: 'task-disabled-daily-todo-control-checkbox',
              inner: 'task-disabled-daily-todo-control-inner',
              content: 'task-disabled-daily-todo-control-content',
            };
          }

          return {
            bg: _nonInteractive(task, userId) ? `task-${color}-control-bg-noninteractive` : `task-${color}-control-bg`,
            checkbox: `task-${color}-control-checkbox`,
            inner: `task-${color}-control-inner-daily-todo`,
            icon: `task-${color}-control-icon`,
          };
        } if (type === 'reward') {
          return {
            bg: _nonInteractive(task, userId) ? 'task-reward-control-bg-noninteractive' : 'task-reward-control-bg',
          };
        } if (type === 'habit') {
          return {
            up: task.up
              ? {
                bg: _nonInteractive(task, userId) ? `task-${color}-control-bg-noninteractive` : `task-${color}-control-bg`,
                inner: _nonInteractive(task, userId) ? `task-${color}-control-inner-habit-noninteractive` : `task-${color}-control-inner-habit`,
                icon: `task-${color}-control-icon`,
              }
              : { bg: 'task-disabled-habit-control-bg', inner: 'task-disabled-habit-control-inner', icon: `task-${color}-control-icon` },
            down: task.down
              ? {
                bg: _nonInteractive(task, userId) ? `task-${color}-control-bg-noninteractive` : `task-${color}-control-bg`,
                inner: _nonInteractive(task, userId) ? `task-${color}-control-inner-habit-noninteractive` : `task-${color}-control-inner-habit`,
                icon: `task-${color}-control-icon`,
              }
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
    const selectedFilter = getActiveFilter(type, filterType);
    const taskOrderForType = state.user.data.tasksOrder[type];

    // order tasks based on user set task order
    // Still needs unit test for this..
    if (requestedTasks.length > 0 && !selectedFilter.sort) {
      requestedTasks = orderSingleTypeTasks(requestedTasks, taskOrderForType);
    }
    return sortAndFilterTasks(requestedTasks, selectedFilter);
  };
}
