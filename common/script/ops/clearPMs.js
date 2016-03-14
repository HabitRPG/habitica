module.exports = function(user, req, cb) {
  user.inbox.messages = {};
  if (typeof user.markModified === "function") {
    user.markModified('inbox.messages');
  }
  return typeof cb === "function" ? cb(null, user.inbox.messages) : void 0;
};
