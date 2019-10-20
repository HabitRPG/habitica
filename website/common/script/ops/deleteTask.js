import get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import i18n from '../i18n';
import { NotFound } from '../libs/errors';

// TODO used only in client, move there?

export default function deleteTask (user, req = {}) {
  const tid = get(req, 'params.id');
  const taskType = get(req, 'params.taskType');

  const index = findIndex(user[`${taskType}s`], task => task._id === tid);

  if (index === -1) {
    throw new NotFound(i18n.t('messageTaskNotFound', req.language));
  }

  user[`${taskType}s`].splice(index, 1);

  return {};
}
