module.exports = function clearPMs (user) {
  user.inbox.messages = {};
  user.markModified('inbox.messages');
  return [
    user.inbox.messages,
  ];
};
