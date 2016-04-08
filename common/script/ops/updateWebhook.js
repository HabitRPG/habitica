import validator from 'validator';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';

module.exports = function updateWebhook (user, req) {
  if (!validator.isURL(req.body.url)) throw new BadRequest(i18n.t('invalidUrl', req.language));
  if (!validator.isBoolean(req.body.enabled)) throw new BadRequest(i18n.t('invalidEnabled', req.language));

  user.markModified('preferences.webhooks');
  user.preferences.webhooks[req.params.id].url = req.body.url;
  user.preferences.webhooks[req.params.id].enabled = req.body.enabled;

  return user.preferences.webhooks[req.params.id];
};
