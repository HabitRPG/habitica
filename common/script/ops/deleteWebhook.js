module.exports = function(user, req, cb) {
  delete user.preferences.webhooks[req.params.id];
  if (typeof user.markModified === "function") {
    user.markModified('preferences.webhooks');
  }
  return typeof cb === "function" ? cb(null, user.preferences.webhooks) : void 0;
};
