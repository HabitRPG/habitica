import packageInfo from '../../../package.json';

export default function responseHandler (req, res, next) {
  // Only used for successful responses
  // Pass `{ includeUserData: false }` as options to omit the user's notifications and version,
  // e.g. for responses whose body should only depend on `data`
  res.respond = function respond (status = 200, data = {}, message, options = {}) {
    const { includeUserData = true } = options;
    const user = res.locals && res.locals.user;

    const response = {
      success: status < 400,
      data,
    };

    if (message) response.message = message;

    if (user && includeUserData) {
      response.notifications = user.notifications;
      response.userV = user._v;
    }

    response.appVersion = packageInfo.version;

    res.status(status).json(response);
  };

  next();
}
