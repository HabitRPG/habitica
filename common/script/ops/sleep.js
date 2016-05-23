module.exports = function(user, req, cb) {
  user.preferences.sleep = !user.preferences.sleep;
  return typeof cb === "function" ? cb(null, {}) : void 0;
};
