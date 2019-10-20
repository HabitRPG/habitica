import validator from 'validator';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';

export default function blockUser (user, req = {}) {
  if (!validator.isUUID(req.params.uuid)) throw new BadRequest(i18n.t('invalidUUID', req.language));
  if (req.params.uuid === user._id) throw new BadRequest(i18n.t('blockYourself', req.language));

  const i = user.inbox.blocks.indexOf(req.params.uuid);
  if (i === -1) {
    user.inbox.blocks.push(req.params.uuid);
  } else {
    user.inbox.blocks.splice(i, 1);
  }

  if (user.markModified) user.markModified('inbox.blocks');
  return [
    user.inbox.blocks,
  ];
}
