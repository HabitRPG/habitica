import packageInfo from '../../../package.json';

export default function responseHandler (req, res, next) {
  // Only used for successful responses
  res.respond = function respond (status = 200, data = {}, message) {
    const user = res.locals && res.locals.user;

    const response = {
      success: status < 400,
      data,
    };

    if (message) response.message = message;

    if (user) {
      response.notifications = user.notifications;
      response.userV = user._v;
    }

    response.appVersion = packageInfo.version;

    res.status(status).json(response);
  };

  next();
}
