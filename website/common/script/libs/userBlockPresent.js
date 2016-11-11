module.exports = function userBlockPresent (sender, receiver) {
  let userBlockedSender = receiver.inbox.blocks.indexOf(sender._id) !== -1;
  let senderBlockedReceiver = sender.inbox.blocks.indexOf(receiver._id) !== -1;
  return userBlockedSender || senderBlockedReceiver;
};
