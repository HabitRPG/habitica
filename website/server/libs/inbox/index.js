import {mapInboxMessage, inboxModel as Inbox} from '../../models/message';
import {getUserInfo, sendTxn as sendTxnEmail} from '../email';
import {sendNotification as sendPushNotification} from '../pushNotifications';
import { model as User } from '../../models/user';

const PM_PER_PAGE = 10;

export async function sentMessage (sender, receiver, message, translate) {
  const messageSent = await sender.sendMessage(receiver, { receiverMsg: message });

  if (receiver.preferences.emailNotifications.newPM !== false) {
    sendTxnEmail(receiver, 'new-pm', [
      {name: 'SENDER', content: getUserInfo(sender, ['name']).name},
    ]);
  }

  if (receiver.preferences.pushNotifications.newPM !== false) {
    sendPushNotification(
      receiver,
      {
        title: translate('newPM', receiver.preferences.language),
        message: translate('newPMInfo', {name: getUserInfo(sender, ['name']).name, message}, receiver.preferences.language),
        identifier: 'newPM',
        category: 'newPM',
        payload: {replyTo: sender._id},
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
          count: {$sum: 1},
        },
      },
      { $sort: {timestamp: -1}}, // sort by latest message
    ]);

  const conversationsList = await query.exec();

  const usersQuery = {
    _id: {$in: conversationsList.map(c => c._id) },
  };

  const usersAr = await User.find(usersQuery,  {
    _id: 1,
    contributor: 1,
    items: 1,
    preferences: 1,
    stats: 1,
  }).exec();
  const usersMap = {};

  for (const usr of usersAr) {
    usersMap[usr._id] = usr;
  }

  const conversations = conversationsList.map((res) => ({
    uuid: res._id,
    ...res,
    userStyles: {
      items: usersMap[res._id].items,
      preferences: usersMap[res._id].preferences,
      stats: usersMap[res._id].stats,
    },
    contributor: usersMap[res._id].contributor,
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
