import taskDefaults from '../libs/taskDefaults';
import i18n from '../i18n';

module.exports = function(user, req, cb) {
  var task;
  task = taskDefaults(req.body);
  if (user.tasks[task.id] != null) {
    return typeof cb === "function" ? cb({
      code: 409,
      message: i18n.t('messageDuplicateTaskID', req.language)
    }) : void 0;
  }
  user[task.type + "s"].unshift(task);
  if (user.preferences.newTaskEdit) {
    task._editing = true;
  }
  if (user.preferences.tagsCollapsed) {
    task._tags = true;
  }
  if (!user.preferences.advancedCollapsed) {
    task._advanced = true;
  }
  if (typeof cb === "function") {
    cb(null, task);
  }
  return task;
};
