/*
Does user have new chat messages?
 */

module.exports = function(messages, lastMessageSeen) {
  if (!((messages != null ? messages.length : void 0) > 0)) {
    return false;
  }
  return (messages != null ? messages[0] : void 0) && (messages[0].id !== lastMessageSeen);
};
