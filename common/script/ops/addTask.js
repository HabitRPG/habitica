import taskDefaults from '../libs/taskDefaults';

// TODO move to client since it's only used there?

module.exports = function addTask (user, req = {body: {}}) {
  let task = taskDefaults(req.body);
  user.tasksOrder[`${task.type}s`].unshift(task._id);
  user[`${task.type}s`].unshift(task);

  task._editing = user.preferences.newTaskEdit;
  task._tags = !user.preferences.tagsCollapsed;
  task._advanced = !user.preferences.advancedCollapsed;

  return task;
};
