import refPush from '../libs/refPush';
import validator from 'validator';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';

module.exports = function addWebhook (user, req = {}) {
  let webhooks = user.preferences.webhooks;

  let id = _.get(req, 'body.id', uuid()); // Use uuid if not supplied
  let enabled = _.get(req, 'body.enabled', true); // Enabled by default
  let url = _.get(req, 'body.url');

  if (!validator.isUUID(id)) {
    throw new BadRequest(i18n.t('invalidWebhookId', req.language));
  }
  if (!url || !validator.isURL(url)) {
    throw new BadRequest(i18n.t('invalidUrl', req.language));
  }
  if (!validator.isBoolean(enabled)) {
    throw new BadRequest(i18n.t('invalidEnabled', req.language));
  }

  user.markModified('preferences.webhooks');

  if (req.v2 === true) {
    return user.preferences.webhooks;
  } else {
    return [
      refPush(webhooks, {
        id,
        url,
        enabled,
      }),
    ];
  }
};
