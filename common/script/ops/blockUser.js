module.exports = function(user, req, cb) {
  var i;
  i = user.inbox.blocks.indexOf(req.params.uuid);
  if (~i) {
    user.inbox.blocks.splice(i, 1);
  } else {
    user.inbox.blocks.push(req.params.uuid);
  }
  if (typeof user.markModified === "function") {
    user.markModified('inbox.blocks');
  }
  return typeof cb === "function" ? cb(null, user.inbox.blocks) : void 0;
};
