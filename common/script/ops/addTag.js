import uuid from '../libs/uuid';

module.exports = function(user, req, cb) {
  if (user.tags == null) {
    user.tags = [];
  }
  user.tags.push({
    name: req.body.name,
    id: req.body.id || uuid()
  });
  return typeof cb === "function" ? cb(null, user.tags) : void 0;
};
