import { each } from 'lodash';
import { post } from 'request';
import { isURL } from 'validator';
import logger from './logger';

let _sendWebhook = (url, body) => {
  post({
    url,
    body,
    json: true,
  }, (err) => {
    if (err) {
      logger.error(err);
    }
  });
};

let _isInvalidWebhook = (hook) => {
  return !hook.enabled || !isURL(hook.url);
};

export function sendTaskWebhook (webhooks, data) {
  each(webhooks, (hook) => {
    if (_isInvalidWebhook(hook)) return;

    let body = {
      direction: data.task.direction,
      task: data.task.details,
      delta: data.task.delta,
      user: data.user,
    };

    _sendWebhook(hook.url, body);
  });
}
