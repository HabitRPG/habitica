// TODO test this middleware
module.exports = function setupBodyMiddleware (req, res, next) {
  req.body = req.body || {};
  next();
};
