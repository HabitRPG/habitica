
module.exports = function(user, req) {
  delete user.preferences.webhooks[req.params.id];
  user.markModified('preferences.webhooks');
};
