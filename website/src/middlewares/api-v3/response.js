module.exports = function responseHandler (req, res, next) {
  // Only used for successful responses
  res.respond = function respond (status = 200, data = {}) {
    res.status(status).json({
      success: status < 400,
      data,
    });
  };

  next();
};
