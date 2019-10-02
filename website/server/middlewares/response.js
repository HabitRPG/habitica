import packageInfo from '../../../package.json';
import {
  model as UserNotification,
} from '../models/userNotification';

export default function responseHandler (req, res, next) {
  // Only used for successful responses
  res.respond = function respond (status = 200, data = {}, message) {
    let user = res.locals && res.locals.user;

    let response = {
      success: status < 400,
      data,
    };

    if (message) response.message = message;

    if (user) {
      response.notifications = UserNotification.convertNotificationsToSafeJson(user.notifications);
      response.userV = user._v;
    }

    response.appVersion = packageInfo.version;

    res.status(status).json(response);
  };

  next();
}
