import i18n from '../i18n';
import _ from 'lodash';

module.exports = function(user, req, cb) {
  var i, tag, tid;
  tid = req.params.id;
  i = _.findIndex(user.tags, {
    id: tid
  });
  if (!~i) {
    return typeof cb === "function" ? cb({
      code: 404,
      message: i18n.t('messageTagNotFound', req.language)
    }) : void 0;
  }
  tag = user.tags[i];
  delete user.filters[tag.id];
  user.tags.splice(i, 1);
  _.each(user.tasks, function(task) {
    return delete task.tags[tag.id];
  });
  _.each(['habits', 'dailys', 'todos', 'rewards'], function(type) {
    return typeof user.markModified === "function" ? user.markModified(type) : void 0;
  });
  return typeof cb === "function" ? cb(null, user.tags) : void 0;
};
