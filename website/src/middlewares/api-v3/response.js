module.exports = function responseHandler (req, res, next) {
  res.respond = function respond (status = 200, data = {}) {
    res.status(status).json(data);
  };

  next();
};
