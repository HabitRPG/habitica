module.exports = function responseHandler (req, res, next) {
  // Only used for successful responses
  res.respond = function respond (status = 200, data = {}, message) {
    let user = res.locals && res.locals.user;

    let response = {
      success: status < 400,
      data,
    };

    if (message) response.message = message;

    if (user) {
      response.notifications = user.notifications.map(notification => notification.toJSON());
      response.userV = user._v;
    }

    res.status(status).json(response);
  };

  next();
};
