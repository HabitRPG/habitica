import taskDefaults from '../libs/taskDefaults';

// TODO move to client since it's only used there?

module.exports = function addTask (user, req = {body: {}}) {
  let task = taskDefaults(req.body);
  user.tasksOrder[`${task.type}s`].unshift(task._id);
  user[`${task.type}s`].unshift(task);

  if (user.preferences.newTaskEdit) {
    task._editing = true;
  }

  if (user.preferences.tagsCollapsed) {
    task._tags = true;
  }

  if (!user.preferences.advancedCollapsed) {
    task._advanced = true;
  }

  return task;
};
