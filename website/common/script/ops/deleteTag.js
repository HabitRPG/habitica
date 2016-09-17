import i18n from '../i18n';
import _ from 'lodash';
import { NotFound } from '../libs/errors';

// TODO used only in client, move there?

module.exports = function deleteTag (user, req = {}) {
  let tid = _.get(req, 'params.id');

  let index = _.findIndex(user.tags, {
    id: tid,
  });

  if (index === -1) {
    throw new NotFound(i18n.t('messageTagNotFound', req.language));
  }

  let tag = user.tags[index];
  delete user.filters[tag.id];

  user.tags.splice(index, 1);

  _.each(user.tasks, (task) => {
    return delete task.tags[tag.id];
  });

  _.each(['habits', 'dailys', 'todos', 'rewards'], (type) => {
    user.markModified(type);
  });

  return user.tags;
};
