// TODO used only in client, move there?

module.exports = function(user, req, cb) {
  var from, ref, to;
  ref = req.query, to = ref.to, from = ref.from;
  if (!((to != null) && (from != null))) {
    return typeof cb === "function" ? cb('?to=__&from=__ are required') : void 0;
  }
  user.tags.splice(to, 0, user.tags.splice(from, 1)[0]);
  return typeof cb === "function" ? cb(null, user.tags) : void 0;
};
