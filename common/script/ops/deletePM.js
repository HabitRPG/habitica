module.exports = function(user, req, cb) {
  delete user.inbox.messages[req.params.id];
  if (typeof user.markModified === "function") {
    user.markModified('inbox.messages.' + req.params.id);
  }
  return typeof cb === "function" ? cb(null, user.inbox.messages) : void 0;
};
