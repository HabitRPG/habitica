// TODO test this middleware
export default function setupBodyMiddleware (req, res, next) {
  req.body = req.body || {};
  next();
}
