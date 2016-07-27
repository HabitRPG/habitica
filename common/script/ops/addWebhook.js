import refPush from '../libs/refPush';
import validator from 'validator';
import i18n from '../i18n';
import {
  BadRequest,
} from '../libs/errors';

// Enumerates webhook types and provides functions for sanitizing options
const WEBHOOK_TYPES = {
  taskScored () {
    return {};
  },
  taskCreated () {
    return {};
  },
  groupChatReceived (options = {}) {
    if (!validator.isUUID(options.groupId)) {
      throw new BadRequest(i18n.t('groupIdRequired'));
    }

    return {
      groupId: options.groupId,
    };
  },
  questActivity (options = {}) {
    return {
      onStart: options.onStart === true,
      onComplete: options.onComplete === true,
      onInvitation: options.onInvitation === true,
    };
  },
};
const DEFAULT_WEBHOOK_TYPE = 'taskScored';

module.exports = function addWebhook (user, req = {}) {
  let wh = user.preferences.webhooks;
  let body = req.body || {};

  if (!validator.isURL(body.url)) {
    throw new BadRequest(i18n.t('invalidUrl', req.language));
  } else if (!validator.isBoolean(body.enabled)) {
    throw new BadRequest(i18n.t('invalidEnabled', req.language));
  }

  let type = body.type || DEFAULT_WEBHOOK_TYPE;

  if (!(type in WEBHOOK_TYPES)) {
    throw new BadRequest(i18n.t('invalidWebhookType', {type}, req.language));
  }

  let options = WEBHOOK_TYPES[type](body.options);

  user.markModified('preferences.webhooks');

  if (req.v2 === true) {
    return user.preferences.webhooks;
  } else {
    return [
      refPush(wh, {
        url: req.body.url,
        type,
        options,
        enabled: req.body.enabled,
      }),
    ];
  }
};
