function isBlocked (user1, user2) {
  return user1.inbox.blocks.indexOf(user2._id) !== -1;
}

module.exports = function userBlockPresent (sender, receiver) {
  let userBlockedSender = isBlocked(receiver, sender);
  let senderBlockedReceiver = isBlocked(sender, receiver);
  return userBlockedSender || senderBlockedReceiver;
};
