import { mapInboxMessage, inboxModel as Inbox } from '../../models/message';
import { getUserInfo, sendTxn as sendTxnEmail } from '../email'; // eslint-disable-line import/no-cycle
import { sendNotification as sendPushNotification } from '../pushNotifications'; // eslint-disable-line import/no-cycle

export async function sentMessage (sender, receiver, message, translate) {
  const messageSent = await sender.sendMessage(receiver, { receiverMsg: message });
  const senderName = getUserInfo(sender, ['name']).name;

  if (receiver.preferences.emailNotifications.newPM !== false) {
    sendTxnEmail(receiver, 'new-pm', [
      { name: 'SENDER', content: senderName },
    ]);
  }

  if (receiver.preferences.pushNotifications.newPM !== false && messageSent.unformattedText) {
    sendPushNotification(
      receiver,
      {
        title: translate(
          'newPMNotificationTitle',
          { name: getUserInfo(sender, ['name']).name },
          receiver.preferences.language,
        ),
        message: messageSent.unformattedText,
        identifier: 'newPM',
        category: 'newPM',
        payload: { replyTo: sender._id, senderName, message: messageSent.unformattedText },
      },
    );
  }

  return messageSent;
}
const PM_PER_PAGE = 10;

const getUserInboxDefaultOptions = {
  asArray: true,
  page: undefined,
  conversation: null,
  mapProps: false,
};

export async function getUserInbox (user, optionParams = getUserInboxDefaultOptions) {
  // if not all properties are passed, fill the default values
  const options = { ...getUserInboxDefaultOptions, ...optionParams };

  const findObj = { ownerId: user._id };

  if (options.conversation) {
    findObj.uuid = options.conversation;
  }

  let query = Inbox
    .find(findObj)
    .sort({ timestamp: -1 });

  if (typeof options.page !== 'undefined') {
    query = query
      .skip(PM_PER_PAGE * Number(options.page))
      .limit(PM_PER_PAGE);
  }

  const messages = (await query.exec()).map(msg => {
    const msgObj = msg.toJSON();

    if (options.mapProps) {
      mapInboxMessage(msgObj, user);
    }

    return msgObj;
  });

  if (options.asArray) {
    return messages;
  }
  const messagesObj = {};
  messages.forEach(msg => { messagesObj[msg._id] = msg; });

  return messagesObj;
}

export async function getUserInboxMessage (user, messageId) {
  return Inbox.findOne({ ownerId: user._id, _id: messageId }).exec();
}

export async function deleteMessage (user, messageId) {
  const message = await Inbox.findOne({ _id: messageId, ownerId: user._id }).exec();
  if (!message) return false;
  await Inbox.remove({ _id: message._id, ownerId: user._id }).exec();

  return true;
}

export async function clearPMs (user) {
  user.inbox.newMessages = 0;

  await Promise.all([
    user.save(),
    Inbox.remove({ ownerId: user._id }).exec(),
  ]);
}
