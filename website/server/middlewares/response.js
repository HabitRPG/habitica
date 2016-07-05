module.exports = function responseHandler (req, res, next) {
  // Only used for successful responses
  res.respond = function respond (status = 200, data = {}, message) {
    let user = res.locals && res.locals.user;

    let response = {
      success: status < 400,
      data,
    };

    if (message) response.message = message;

    // When userV=Number (user version) query parameter is passed and a user is logged in,
    // sends back the current user._v in the response so that the client
    // can verify if it's the most up to date data.
    // Considered part of the private API for now and not officially supported
    if (user) {
      response.notifications = user.notifications.map(notification => notification.toJSON());
      if (req.query.userV) {
        response.userV = user._v;
      }
    }

    res.status(status).json(response);
  };

  next();
};
