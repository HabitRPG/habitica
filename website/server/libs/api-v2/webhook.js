var _ = require('lodash');
var request = require('request');
var validator = require('validator');

function sendTaskWebhook(webhooks, data) {
  _.each(webhooks, function(hook){
    if (!hook.enabled || !validator.isURL(hook.url)) return;

    request.post({
      url: hook.url,
      body: {
        direction: data.task.direction,
        task: data.task.details,
        delta: data.task.delta,
        user: data.user
      },
      json: true
    });
  });
}

module.exports = {
  sendTaskWebhook: sendTaskWebhook
};
