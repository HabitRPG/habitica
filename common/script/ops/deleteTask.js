import i18n from '../i18n';
import { NotFound } from '../libs/errors';
import _ from 'lodash';

// TODO used only in client, move there?

module.exports = function deleteTask (user, req = {}) {
  let tid = _.get(req, 'params.id');
  let taskType = _.get(req, 'params.taskType');

  let index = _.findIndex(user[`${taskType}s`], function findById (task) {
    return task._id === tid;
  });

  if (index === -1) {
    throw new NotFound(i18n.t('messageTaskNotFound', req.language));
  }

  user[`${taskType}s`].splice(index, 1);

  return {};
};
