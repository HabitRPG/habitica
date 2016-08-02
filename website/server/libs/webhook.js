import { post } from 'request';
import { isURL } from 'validator';
import logger from './logger';
import common from '../../../common';

function sendWebhook (url, body) {
  post({
    url,
    body,
    json: true,
  }, (err) => logger.error(err));
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
    let hooks = Object.keys(webhooks)
      .map(hook => webhooks[hook])
      .filter(isValidWebhook)
      .filter(hook => this.type === hook.type)
      .filter(hook => this.webhookFilter(hook, data));

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
  type: 'taskScored',
  transformData (data) {
    let { user, task, direction, delta } = data;

    let extendedStats = Object.assign({
      toNextLevel: common.tnl(user.stats.lvl),
      maxHealth: common.maxHealth,
      maxMP: common.statsComputed(user).maxMP,
    }, user.stats);
    let userData = {
      _id: user._id,
      _tmp: user._tmp,
      stats: extendedStats,
    };

    let taskData = {
      details: task,
      direction,
      delta,
    };

    let dataToSend = {
      user: userData,
      task: taskData,
    };

    return dataToSend;
  },
});

export let taskCreatedWebhook = new WebhookSender({
  type: 'taskCreated',
});

export let groupChatReceivedWebhook = new WebhookSender({
  type: 'groupChatReceived',
  webhookFilter (hook, data) {
    if (hook.options.allGroups) {
      return true;
    }

    let groupId = data.group.id;
    return hook.options.groupIds[groupId];
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
