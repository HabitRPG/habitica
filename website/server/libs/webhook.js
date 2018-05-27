import got from 'got';
import { isURL } from 'validator';
import logger from './logger';
import nconf from 'nconf';
import {
  model as User,
} from '../models/user';

const IS_PRODUCTION = nconf.get('IS_PROD');

function sendWebhook (url, body) {
  got.post(url, {
    body,
    json: true,
  }).catch(err => logger.error(err));
}

function isValidWebhook (hook) {
  return hook.enabled && isURL(hook.url, {
    require_tld: IS_PRODUCTION ? true : false, // eslint-disable-line camelcase
  });
}

export class WebhookSender {
  constructor (options = {}) {
    this.type = options.type;
    this.transformData = options.transformData || WebhookSender.defaultTransformData;
    this.webhookFilter = options.webhookFilter || WebhookSender.defaultWebhookFilter;
  }

  static defaultTransformData (data) {
    return data;
  }

  static defaultWebhookFilter () {
    return true;
  }

  attachDefaultData (user, body) {
    body.webhookType = this.type;
    body.user = body.user || {};
    body.user._id = user._id;
  }

  send (user, data) {
    const webhooks = user.webhooks;

    let hooks = webhooks.filter((hook) => {
      if (!isValidWebhook(hook)) return false;
      if (hook.type === 'globalActivity') return true;

      return this.type === hook.type && this.webhookFilter(hook, data);
    });

    if (hooks.length < 1) {
      return; // prevents running the body creation code if there are no webhooks to send
    }

    let body = this.transformData(data);
    this.attachDefaultData(user, body);

    hooks.forEach((hook) => {
      sendWebhook(hook.url, body);
    });
  }
}

export let taskScoredWebhook = new WebhookSender({
  type: 'taskActivity',
  webhookFilter (hook) {
    let scored = hook.options && hook.options.scored;

    return scored;
  },
  transformData (data) {
    let { user, task, direction, delta } = data;

    let extendedStats = User.addComputedStatsToJSONObj(user.stats.toJSON(), user);

    let userData = {
      // _id: user._id, added automatically when the webhook is sent
      _tmp: user._tmp,
      stats: extendedStats,
    };

    let dataToSend = {
      type: 'scored',
      direction,
      delta,
      task,
      user: userData,
    };

    return dataToSend;
  },
});

export let taskActivityWebhook = new WebhookSender({
  type: 'taskActivity',
  webhookFilter (hook, data) {
    let { type } = data;
    return hook.options[type];
  },
});

export let userActivityWebhook = new WebhookSender({
  type: 'userActivity',
  webhookFilter (hook, data) {
    let { type } = data;
    return hook.options[type];
  },
});

export let questActivityWebhook = new WebhookSender({
  type: 'questActivity',
  webhookFilter (hook, data) {
    let { type } = data;
    return hook.options[type];
  },
  transformData (data) {
    let { group, quest, type } = data;

    let dataToSend = {
      type,
      group: {
        id: group.id,
        name: group.name,
      },
      quest: {
        key: quest.key,
      },
    };

    return dataToSend;
  },
});

export let groupChatReceivedWebhook = new WebhookSender({
  type: 'groupChatReceived',
  webhookFilter (hook, data) {
    return hook.options.groupId === data.group.id;
  },
  transformData (data) {
    let { group, chat } = data;

    let dataToSend = {
      group: {
        id: group.id,
        name: group.name,
      },
      chat,
    };

    return dataToSend;
  },
});
