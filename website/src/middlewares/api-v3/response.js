export default function responseHandler (req, res, next) {
  res.respond = function respond (status = 200, data = {}) {
    res.status(status);
    data.success = status >= 400 ? false : true; // TODO the data object should be cloned to avoid pollution?
    res.json(data);
  };

  next();
}
