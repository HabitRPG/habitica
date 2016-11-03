import { post } from 'request';
import { isURL } from 'validator';
import logger from './logger';

function sendWebhook (url, body) {
  post({
    url,
    body,
    json: true,
  }, (err) => {
    if (err) {
      logger.error(err);
    }
  });
}

function isValidWebhook (hook) {
  return hook.enabled && isURL(hook.url);
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

  send (webhooks, data) {
    let hooks = webhooks.filter((hook) => {
      return isValidWebhook(hook) &&
        this.type === hook.type &&
        this.webhookFilter(hook, data);
    });

    if (hooks.length < 1) {
      return; // prevents running the body creation code if there are no webhooks to send
    }

    let body = this.transformData(data);

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

    let extendedStats = user.addComputedStatsToJSONObj(user.stats.toJSON());

    let userData = {
      _id: user._id,
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
