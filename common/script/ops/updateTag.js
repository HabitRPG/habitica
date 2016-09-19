import i18n from '../i18n';
import _ from 'lodash';
import { NotFound } from '../libs/errors';

// TODO used only in client, move there?

module.exports = function updateTag (user, req = {}) {
  let tid = _.get(req, 'params.id');

  let index = _.findIndex(user.tags, {
    id: tid,
  });

  if (index === -1) {
    throw new NotFound(i18n.t('messageTagNotFound', req.language));
  }

  user.tags[index].name = _.get(req, 'body.name');
  return user.tags[index];
};
