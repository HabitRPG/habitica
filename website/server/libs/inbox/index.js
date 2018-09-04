export async function deleteMessage (user, messageId) {
  if (user.inbox.messages[messageId]) {
    delete user.inbox.messages[messageId];
    user.markModified(`inbox.messages.${messageId}`);
    await user.save();
  } else {
    return false;
  }

  return true;
}
