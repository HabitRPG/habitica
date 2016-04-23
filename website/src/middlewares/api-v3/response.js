module.exports = function responseHandler (req, res, next) {
  // Only used for successful responses
  res.respond = function respond (status = 200, data = {}, message) {
    let response = {
      success: status < 400,
      data,
    };

    if (message) response.message = message;

    res.status(status).json(response);
  };

  next();
};
