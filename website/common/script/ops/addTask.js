import clone from 'lodash/clone';
import taskDefaults from '../libs/taskDefaults';

// TODO move to client since it's only used there?

export default function addTask (user, req = { body: {} }) {
  const task = taskDefaults(req.body, user);
  user.tasksOrder[`${task.type}s`].unshift(task._id);
  user[`${task.type}s`].unshift(task);

  task._editing = user.preferences.newTaskEdit;
  if (task._editing) {
    task._edit = clone(task);
  }
  task._advanced = !user.preferences.advancedCollapsed;

  return task;
}
