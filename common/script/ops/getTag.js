import _ from 'lodash';
import i18n from '../i18n';
import { NotFound } from '../libs/errors';

// TODO used only in client, move there?

module.exports = function getTag (user, req = {}) {
  let tid = _.get(req, 'params.id');

  let index = _.findIndex(user.tags, {
    id: tid,
  });
  if (index === -1) {
    throw new NotFound(i18n.t('messageTagNotFound', req.language));
  }

  return user.tags[index];
};
