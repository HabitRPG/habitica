import get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import each from 'lodash/each';
import i18n from '../i18n';
import { NotFound } from '../libs/errors';

// TODO used only in client, move there?

export default function deleteTag (user, req = {}) {
  const tid = get(req, 'params.id');

  const index = findIndex(user.tags, {
    id: tid,
  });

  if (index === -1) {
    throw new NotFound(i18n.t('messageTagNotFound', req.language));
  }

  const tag = user.tags[index];
  delete user.filters[tag.id];

  user.tags.splice(index, 1);

  each(user.tasks, task => delete task.tags[tag.id]);

  each(['habits', 'dailys', 'todos', 'rewards'], type => {
    if (user.markModified) user.markModified(type);
  });

  return user.tags;
}
