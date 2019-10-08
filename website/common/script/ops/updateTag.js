import get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import i18n from '../i18n';
import { NotFound } from '../libs/errors';

// TODO used only in client, move there?

export default function updateTag (user, req = {}) {
  const tid = get(req, 'params.id');

  const index = findIndex(user.tags, {
    id: tid,
  });

  if (index === -1) {
    throw new NotFound(i18n.t('messageTagNotFound', req.language));
  }

  user.tags[index].name = get(req, 'body.name');
  return user.tags[index];
}
