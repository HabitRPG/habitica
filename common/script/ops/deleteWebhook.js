import _ from 'lodash';
import { NotFound } from '../libs/errors';

module.exports = function deleteWebhook (user, req) {
  let id = _.get(req, 'params.id');

  if (!user.preferences.webhooks[id]) {
    throw new NotFound('webhookNotFound');
  }

  delete user.preferences.webhooks[id];
  user.markModified('preferences.webhooks');

  return [
    user.preferences.webhooks,
  ];
};
