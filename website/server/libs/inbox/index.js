import { inboxModel as Inbox } from '../../models/message';
import { toArray, orderBy } from 'lodash';

export async function getUserInbox (user, asArray = true) {
  const messages = (await Inbox
    .find({ownerId: user._id})
    .exec()).map(msg => msg.toJSON());

  const messagesObj = Object.assign({}, user.inbox.messages); // copy, shallow clone

  if (asArray) {
    messages.push(...toArray(messagesObj));

    return orderBy(messages, ['timestamp'], ['desc']);
  } else {
    messages.forEach(msg => messagesObj[msg._id] = msg);

    return messagesObj;
  }
}

export async function deleteMessage (user, messageId) {
  if (user.inbox.messages[messageId]) { // compatibility
    delete user.inbox.messages[messageId];
    user.markModified(`inbox.messages.${messageId}`);
    await user.save();
  } else {
    const message = await Inbox.findOne({_id: messageId, ownerId: user._id }).exec();
    if (!message) return false;
    await Inbox.remove({_id: message._id, ownerId: user._id}).exec();
  }

  return true;
}

export async function clearPMs (user) {
  user.inbox.newMessages = 0;

  // compatibility
  user.inbox.messages = {};
  user.markModified('inbox.messages');

  await Promise.all([
    user.save(),
    Inbox.remove({ownerId: user._id}).exec(),
  ]);
}

export async function updateMessage (message) {
  const messagesInDb = await Inbox
    .find({id: message.id})
    .exec();

  const messageInDb = messagesInDb[0];

  await messageInDb.update(message);
}
