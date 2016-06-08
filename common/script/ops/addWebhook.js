import refPush from '../libs/refPush';
import validator from 'validator';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';
import _ from 'lodash';

module.exports = function addWebhook (user, req = {}) {
  let wh = user.preferences.webhooks;

  if (!validator.isURL(_.get(req, 'body.url'))) throw new BadRequest(i18n.t('invalidUrl', req.language));
  if (!validator.isBoolean(String(_.get(req, 'body.enabled')))) throw new BadRequest(i18n.t('invalidEnabled', req.language));

  user.markModified('preferences.webhooks');

  if (req.v2 === true) {
    return user.preferences.webhooks;
  } else {
    return [
      refPush(wh, {
        url: req.body.url,
        enabled: req.body.enabled,
      }),
    ];
  }
};
