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
        title: translate('newPMNotificationTitle', {name: getUserInfo(sender, ['name']).name}, receiver.preferences.language),
        message,
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

async function usersMapByConversations (owner, users) {
  let query = Inbox
    .aggregate([
      {
        $match: {
          ownerId: owner._id,
          uuid: { $in: users },
        },
      },
      {
        $group: {
          _id: '$uuid',
          userStyles: {$last: '$userStyles'},
          contributor: {$last: '$contributor'},
        },
      },
    ]);


  const usersAr = await query.exec();
  const usersMap = {};

  for (const usr of usersAr) {
    usersMap[usr._id] = usr;
  }

  return usersMap;
}

export async function listConversations (owner) {
  // group messages by user owned by logged-in user
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

  const userIdList = conversationsList.map(c => c._id);

  // get user-info based on conversations
  const usersMap = await usersMapByConversations(owner, userIdList);

  const conversations = conversationsList.map((res) => ({
    uuid: res._id,
    ...res,
    userStyles: usersMap[res._id].userStyles,
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
