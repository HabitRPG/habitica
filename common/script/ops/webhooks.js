import refPush from '../libs/refPush';
import validator from 'validator';
import i18n from '../i18n';
import { v4 as uuid } from 'uuid';
import {
  BadRequest,
  NotFound,
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
    let { groupId } = options;

    if (!validator.isUUID(groupId)) {
      throw new BadRequest(i18n.t('groupIdRequired'));
    }

    return {
      groupId,
    };
  },
};
const DEFAULT_WEBHOOK_TYPE = 'taskScored';

function generateWebhookObject (webhook, req) {
  if (!webhook.url || !validator.isURL(webhook.url)) {
    throw new BadRequest(i18n.t('invalidUrl', req.language));
  } else if (!validator.isBoolean(webhook.enabled)) {
    throw new BadRequest(i18n.t('invalidEnabled', req.language));
  }

  let type = webhook.type || DEFAULT_WEBHOOK_TYPE;

  if (!(type in WEBHOOK_TYPES)) {
    throw new BadRequest(i18n.t('invalidWebhookType', {type}, req.language));
  }

  let options = WEBHOOK_TYPES[type](webhook.options);

  return {
    id: webhook.id,
    url: webhook.url,
    enabled: webhook.enabled,
    type,
    options,
  };
}

function addWebhook (user, req = {}) {
  let webhooks = user.preferences.webhooks;
  let body = req.body || {};
  let id = body.id || uuid();
  let enabled = 'enabled' in body ? body.enabled : true;

  if (!validator.isUUID(id)) {
    throw new BadRequest(i18n.t('invalidWebhookId', req.language));
  }

  let webhook = generateWebhookObject({
    id,
    url: body.url,
    enabled,
    type: body.type || DEFAULT_WEBHOOK_TYPE,
    options: body.options,
  }, req);

  user.markModified('preferences.webhooks');

  webhook = refPush(webhooks, webhook);

  if (req.v2 === true) {
    return user.preferences.webhooks;
  } else {
    return [webhook];
  }
}

function updateWebhook (user, req = {}) {
  let body = req.body || {};
  let id = req.params.id;
  let oldWebhook = user.preferences.webhooks[id];

  if (!oldWebhook) {
    throw new NotFound(i18n.t('noWebhookWithId', {id}, req.language));
  }

  let webhook = {
    id: oldWebhook.id,
    url: body.url || oldWebhook.url,
    type: body.type || oldWebhook.type,
    options: body.options || oldWebhook.options,
  };

  if ('enabled' in body) {
    webhook.enabled = body.enabled;
  } else {
    webhook.enabled = oldWebhook.enabled;
  }

  webhook = generateWebhookObject(webhook, req);

  user.markModified('preferences.webhooks');

  user.preferences.webhooks[id].url = webhook.url;
  user.preferences.webhooks[id].enabled = webhook.enabled;
  user.preferences.webhooks[id].type = webhook.type;
  user.preferences.webhooks[id].options = webhook.options;

  if (req.v2 === true) {
    return user.preferences.webhooks;
  } else {
    return [user.preferences.webhooks[id]];
  }
}

function deleteWebhook (user, req = {}) {
  let id = req.params.id;

  if (!user.preferences.webhooks[id]) {
    throw new NotFound(i18n.t('noWebhookWithId', {id}, req.language));
  }

  delete user.preferences.webhooks[id];

  user.markModified('preferences.webhooks');

  return [
    user.preferences.webhooks,
  ];
}

module.exports = {
  addWebhook,
  updateWebhook,
  deleteWebhook,
};
