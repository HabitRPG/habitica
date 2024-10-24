import got from 'got';
import { isURL } from 'validator';
import nconf from 'nconf';
import moment from 'moment';
import logger from './logger';
import { // eslint-disable-line import/no-cycle
  model as User,
} from '../models/user';

const IS_PRODUCTION = nconf.get('IS_PROD');

function sendWebhook (webhook, body, user) {
  const { url, lastFailureAt } = webhook;

  got.post(url, {
    json: body,
    timeout: 30000, // wait up to 30s before timing out
    retry: 3, // retry the request up to 3 times
  // Not calling .json() to parse the response because we simply ignore it
  }).catch(webhookErr => {
    // Log the error
    logger.error(webhookErr, {
      extraMessage: 'Error while sending a webhook request.',
      userId: user._id,
      webhookId: webhook.id,
    });

    let _failuresReset = false;

    // Reset failures if the last one happened more than 1 month ago
    const oneMonthAgo = moment().subtract(1, 'months');
    if (!lastFailureAt || moment(lastFailureAt).isBefore(oneMonthAgo)) {
      webhook.failures = 0;
      _failuresReset = true;
    }

    // Increase the number of failures
    webhook.failures += 1;
    webhook.lastFailureAt = new Date();

    // Disable a webhook with too many failures
    if (webhook.failures >= 10) {
      webhook.enabled = false;
      webhook.failures = 0;
      webhook.lastFailureAt = undefined;
      _failuresReset = true;
    }

    const update = {
      $set: {
        'webhooks.$.lastFailureAt': webhook.lastFailureAt,
        'webhooks.$.enabled': webhook.enabled,
      },
    };

    if (_failuresReset) {
      update.$set['webhooks.$.failures'] = webhook.failures;
    } else {
      update.$inc = {
        'webhooks.$.failures': 1,
      };
    }

    return User.updateOne({
      _id: user._id,
      'webhooks.id': webhook.id,
    }, update).exec();
  }).catch(err => logger.error(err)); // log errors that might have happened in the previous catch
}

function isValidWebhook (hook) {
  return hook.enabled && isURL(hook.url, {
    require_tld: !!IS_PRODUCTION, // eslint-disable-line camelcase
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
    const { webhooks } = user;

    const hooks = webhooks.filter(hook => {
      if (!isValidWebhook(hook)) return false;
      if (hook.type === 'globalActivity') return true;

      return this.type === hook.type && this.webhookFilter(hook, data);
    });

    if (hooks.length < 1) {
      return; // prevents running the body creation code if there are no webhooks to send
    }

    const body = this.transformData(data);
    this.attachDefaultData(user, body);

    hooks.forEach(hook => {
      sendWebhook(hook, body, user);
    });
  }
}

export const taskScoredWebhook = new WebhookSender({
  type: 'taskActivity',
  webhookFilter (hook) {
    const scored = hook.options && hook.options.scored;

    return scored;
  },
  transformData (data) {
    const {
      user, task, direction, delta,
    } = data;

    const extendedStats = User.addComputedStatsToJSONObj(user.stats.toJSON(), user);

    const userData = {
      // _id: user._id, added automatically when the webhook is sent
      _tmp: user._tmp,
      stats: extendedStats,
    };

    const dataToSend = {
      type: 'scored',
      direction,
      delta,
      task,
      user: userData,
    };

    return dataToSend;
  },
});

export const taskActivityWebhook = new WebhookSender({
  type: 'taskActivity',
  webhookFilter (hook, data) {
    const { type } = data;
    return hook.options[type];
  },
});

export const userActivityWebhook = new WebhookSender({
  type: 'userActivity',
  webhookFilter (hook, data) {
    const { type } = data;
    return hook.options[type];
  },
});

export const questActivityWebhook = new WebhookSender({
  type: 'questActivity',
  webhookFilter (hook, data) {
    const { type } = data;
    return hook.options[type];
  },
  transformData (data) {
    const { group, quest, type } = data;

    const dataToSend = {
      type,
      group: {
        id: group.id,
        name: group.name,
      },
      quest: {
        key: quest.key,
        questOwner: group.quest.leader,
      },
    };

    return dataToSend;
  },
});

export const groupChatReceivedWebhook = new WebhookSender({
  type: 'groupChatReceived',
  webhookFilter (hook, data) {
    return hook.options.groupId === data.group.id;
  },
  transformData (data) {
    const { group, chat } = data;

    const dataToSend = {
      group: {
        id: group.id,
        name: group.name,
      },
      chat,
    };

    return dataToSend;
  },
});
