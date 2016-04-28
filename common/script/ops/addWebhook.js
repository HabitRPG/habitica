import refPush from '../libs/refPush';

module.exports = function(user, req, cb) {
  var wh;
  wh = user.preferences.webhooks;
  refPush(wh, {
    url: req.body.url,
    enabled: req.body.enabled || true,
    id: req.body.id
  });
  if (typeof user.markModified === "function") {
    user.markModified('preferences.webhooks');
  }
  return typeof cb === "function" ? cb(null, user.preferences.webhooks) : void 0;
};
