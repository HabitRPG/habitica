import {mapInboxMessage, inboxModel as Inbox} from '../../models/message';
import {getUserInfo, sendTxn as sendTxnEmail} from '../email';
import {sendNotification as sendPushNotification} from '../pushNotifications';

const PM_PER_PAGE = 10;

export async function sentMessage (sender, receiver, message, translate) {
  const messageSent = await sender.sendMessage(receiver, { receiverMsg: message });
  const senderName = getUserInfo(sender, ['name']).name;

  if (receiver.preferences.emailNotifications.newPM !== false) {
    sendTxnEmail(receiver, 'new-pm', [
      {name: 'SENDER', content: senderName},
    ]);
  }

  if (receiver.preferences.pushNotifications.newPM !== false) {
    sendPushNotification(
      receiver,
      {
        title: translate('newPM'),
        message: translate('newPMInfo', {name: senderName, message}, receiver.preferences.language),
        identifier: 'newPM',
        category: 'newPM',
        payload: {replyTo: sender._id, senderName, message},
      }
    );
  }

  return messageSent;
}

export async function getUserInbox (user, options = {asArray: true, page: 0, conversation: null, mapProps: false}) {
  if (typeof options.asArray === 'undefined') {
    options.asArray = true;
  }

  if (typeof options.mapProps === 'undefined') {
    options.mapProps = false;
  }

  const findObj = {ownerId: user._id};

  if (options.conversation) {
    findObj.uuid = options.conversation;
  }

  let query = Inbox
    .find(findObj)
    .sort({timestamp: -1});

  if (typeof options.page !== 'undefined') {
    query = query
      .limit(PM_PER_PAGE)
      .skip(PM_PER_PAGE * Number(options.page));
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
  } else {
    const messagesObj = {};
    messages.forEach(msg => messagesObj[msg._id] = msg);

    return messagesObj;
  }
}

export async function listConversations (owner) {
  let query = Inbox
    .aggregate([
      {
        $match: {
          ownerId: owner._id,
        },
      },
      {
        $group: {
          _id: '$uuid',
          user: {$last: '$user' },
          username: {$last: '$username' },
          timestamp: {$last: '$timestamp'},
          text: {$last: '$text'},
          userStyles: {$last: '$userStyles'},
          contributor: {$last: '$contributor'},
          count: {$sum: 1},
        },
      },
      { $sort: {timestamp: -1}}, // sort by latest message
    ]);

  const conversationsList = await query.exec();

  const conversations = conversationsList.map((res) => ({
    uuid: res._id,
    ...res,
  }));

  return conversations;
}

export async function getUserInboxMessage (user, messageId) {
  return Inbox.findOne({ownerId: user._id, _id: messageId}).exec();
}

export async function deleteMessage (user, messageId) {
  const message = await Inbox.findOne({_id: messageId, ownerId: user._id}).exec();
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
