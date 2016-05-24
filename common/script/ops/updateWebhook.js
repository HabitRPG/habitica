import validator from 'validator';
import i18n from '../i18n';
import {
  BadRequest,
  NotFound,
} from '../libs/errors';
import _ from 'lodash';

module.exports = function updateWebhook (user, req) {
  let url = _.get(req, 'body.url');
  let enabled = _.get(req, 'body.enabled');
  let id = _.get(req, 'body.enabled');

  if (!id) throw new BadRequest(i18n.t('missingWebhookId', req.language));
  if (url && !validator.isURL(url)) throw new BadRequest(i18n.t('invalidUrl', req.language));
  if (enabled && !validator.isBoolean(enabled)) throw new BadRequest(i18n.t('invalidEnabled', req.language));

  let webhook = user.preferences.webhooks[id];
  if (!webhook) throw new NotFound(i18n.t('webhookNotFound', req.language));

  user.markModified('preferences.webhooks');
  if (url) webhook.url = url;
  if (enabled) webhook.enabled = enabled;

  if (req.v2 === true) {
    return user.preferences.webhooks;
  } else {
    return [webhook];
  }
};
