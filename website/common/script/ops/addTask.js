import taskDefaults from '../libs/taskDefaults';
import clone from 'lodash/clone';

// TODO move to client since it's only used there?

module.exports = function addTask (user, req = {body: {}}) {
  let task = taskDefaults(req.body);
  user.tasksOrder[`${task.type}s`].unshift(task._id);
  user[`${task.type}s`].unshift(task);

  task._editing = user.preferences.newTaskEdit;
  if (task._editing) {
    task._edit = clone(task);
  }
  task._advanced = !user.preferences.advancedCollapsed;

  return task;
};
