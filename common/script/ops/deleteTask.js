import i18n from '../i18n';
import { NotFound } from '../libs/errors';
import _ from 'lodash';

// TODO used only in client, move there?

module.exports = function deleteTask (user, req = {}) {
  let tid = _.get(req, 'params.id');
  let task = user.tasks[tid];

  if (!task) {
    throw new NotFound(i18n.t('messageTaskNotFound', req.language));
  }

  let index = user[`${task.type}s`].indexOf(task);
  if (index !== -1) {
    user[`${task.type}s`].splice(index, 1);
  }

  return {};
};
