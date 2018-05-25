import i18n from '../i18n';
import get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import each from 'lodash/each';
import { NotFound } from '../libs/errors';

// TODO used only in client, move there?

module.exports = function deleteTag (user, req = {}) {
  let tid = get(req, 'params.id');

  let index = findIndex(user.tags, {
    id: tid,
  });

  if (index === -1) {
    throw new NotFound(i18n.t('messageTagNotFound', req.language));
  }

  let tag = user.tags[index];
  delete user.filters[tag.id];

  user.tags.splice(index, 1);

  each(user.tasks, (task) => {
    return delete task.tags[tag.id];
  });

  each(['habits', 'dailys', 'todos', 'rewards'], (type) => {
    if (user.markModified) user.markModified(type);
  });

  return user.tags;
};
