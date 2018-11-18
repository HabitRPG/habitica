import { inboxModel as Inbox } from '../../models/message';

export async function getUserInbox (user, asArray = true) {
  const messages = (await Inbox
    .find({ownerId: user._id})
    .sort({timestamp: -1})
    .exec()).map(msg => msg.toJSON());

  if (asArray) {
    return messages;
  } else {
    const messagesObj = {};
    messages.forEach(msg => messagesObj[msg._id] = msg);

    return messagesObj;
  }
}

export async function getUserInboxMessage (user, messageId) {
  return Inbox.findOne({ownerId: user._id, _id: messageId}).exec();
}

export async function deleteMessage (user, messageId) {
  const message = await Inbox.findOne({_id: messageId, ownerId: user._id }).exec();
  if (!message) return false;
  await Inbox.remove({_id: message._id, ownerId: user._id}).exec();

  return true;
}

export async function clearPMs (user) {
  user.inbox.newMessages = 0;

  await Promise.all([
    user.save(),
    Inbox.remove({ownerId: user._id}).exec(),
  ]);
}
