import validator from 'validator';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';

module.exports = function blockUser (user, req = {}) {
  if (!validator.isUUID(req.params.uuid)) throw new BadRequest(i18n.t('invalidUUID', req.language));

  let i = user.inbox.blocks.indexOf(req.params.uuid);
  if (i === -1) {
    user.inbox.blocks.push(req.params.uuid);
  } else {
    user.inbox.blocks.splice(i, 1);
  }

  user.markModified('inbox.blocks');
  return [
    user.inbox.blocks,
  ];
};
