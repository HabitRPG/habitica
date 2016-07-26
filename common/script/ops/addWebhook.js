import refPush from '../libs/refPush';
import validator from 'validator';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';
import _ from 'lodash';

const WEBHOOK_TYPES = [
  'taskScored',
  'taskCreated',
  'groupChatReceived',
  'questActivity',
];
const DEFAULT_WEBHOOK_TYPE = WEBHOOK_TYPES[0];

module.exports = function addWebhook (user, req = {}) {
  let wh = user.preferences.webhooks;

  if (!validator.isURL(_.get(req, 'body.url'))) {
    throw new BadRequest(i18n.t('invalidUrl', req.language));
  } else if (!validator.isBoolean(_.get(req, 'body.enabled'))) {
    throw new BadRequest(i18n.t('invalidEnabled', req.language));
  }

  let kind = _.get(req, 'body.kind') || DEFAULT_WEBHOOK_TYPE;

  if (WEBHOOK_TYPES.indexOf(kind) === -1) {
    throw new BadRequest(i18n.t('invalidWebhookKind', {kind}, req.language));
  }

  user.markModified('preferences.webhooks');

  if (req.v2 === true) {
    return user.preferences.webhooks;
  } else {
    return [
      refPush(wh, {
        url: req.body.url,
        kind,
        enabled: req.body.enabled,
      }),
    ];
  }
};
