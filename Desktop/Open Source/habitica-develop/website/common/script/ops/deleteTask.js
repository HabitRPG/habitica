import i18n from '../i18n';
import { NotFound } from '../libs/errors';
import get from 'lodash/get';
import findIndex from 'lodash/findIndex';

// TODO used only in client, move there?

module.exports = function deleteTask (user, req = {}) {
  let tid = get(req, 'params.id');
  let taskType = get(req, 'params.taskType');

  let index = findIndex(user[`${taskType}s`], function findById (task) {
    return task._id === tid;
  });

  if (index === -1) {
    throw new NotFound(i18n.t('messageTaskNotFound', req.language));
  }

  user[`${taskType}s`].splice(index, 1);

  return {};
};
