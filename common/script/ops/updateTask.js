import i18n from '../i18n';
import _ from 'lodash';

module.exports = function(user, req, cb) {
  var ref, task;
  if (!(task = user.tasks[(ref = req.params) != null ? ref.id : void 0])) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: i18n.t('messageTaskNotFound', req.language)
    }) : void 0;
  }
  _.merge(task, _.omit(req.body, ['checklist', 'reminders', 'id', 'type']));
  if (req.body.checklist) {
    task.checklist = req.body.checklist;
  }
  if (req.body.reminders) {
    task.reminders = req.body.reminders;
  }
  if (typeof task.markModified === "function") {
    task.markModified('tags');
  }
  return typeof cb === "function" ? cb(null, task) : void 0;
};
