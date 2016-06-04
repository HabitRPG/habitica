import uuid from '../libs/uuid';
import _ from 'lodash';

module.exports = function addNotification (user, notification) {
  let notification = {
    id: uuid(),
  };
  _.defaults(notification, req.body);

  user.notifications.push(notification);

  return [notification];
};
