import i18n from '../i18n';

// TODO used only in client, move there?

module.exports = function(user, req, cb) {
  var i, ref, task;
  task = user.tasks[(ref = req.params) != null ? ref.id : void 0];
  if (!task) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: i18n.t('messageTaskNotFound', req.language)
    }) : void 0;
  }
  i = user[task.type + "s"].indexOf(task);
  if (~i) {
    user[task.type + "s"].splice(i, 1);
  }
  return typeof cb === "function" ? cb(null, {}) : void 0;
};
