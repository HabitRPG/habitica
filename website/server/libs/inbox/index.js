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
    messages.forEach(msg => messagesObj[msg._id] = msg.toJSON());

    return messagesObj;
  }
}
