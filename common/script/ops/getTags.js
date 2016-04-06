// TODO used only in client, move there?

module.exports = function(user, req, cb) {
  return typeof cb === "function" ? cb(null, user.tags) : void 0;
};
