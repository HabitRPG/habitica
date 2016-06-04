import i18n from '../i18n';
import _ from 'lodash';
import { NotFound } from '../libs/errors';

module.exports = function readNotification (user, req = {}) {
  let notificationId = _.get(req, 'params.id');

  let index = _.findIndex(user.notification, {
    id: notificationId,
  });

  if (index === -1) {
    throw new NotFound(i18n.t('messageNotificationNotFound', req.language));
  }

  user.notifications.splice(index, 1);

  return [user.notifications];
};
