module.exports = function clearPMs (user) {
  user.inbox.messages = {};
  if (user.markModified) user.markModified('inbox.messages');
  return [
    user.inbox.messages,
  ];
};
