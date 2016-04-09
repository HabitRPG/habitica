import _ from 'lodash';

module.exports = function deleteWebhook (user, req) {
  delete user.preferences.webhooks[_.get(req, 'params.id')];
  user.markModified('preferences.webhooks');

  return user.preferences.webhooks;
};
