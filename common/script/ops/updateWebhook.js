import _ from 'lodash';

module.exports = function(user, req, cb) {
  _.merge(user.preferences.webhooks[req.params.id], req.body);
  if (typeof user.markModified === "function") {
    user.markModified('preferences.webhooks');
  }
  return typeof cb === "function" ? cb(null, user.preferences.webhooks) : void 0;
};
