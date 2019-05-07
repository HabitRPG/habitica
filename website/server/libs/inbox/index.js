import {inboxModel as Inbox} from '../../models/message';
import {
  model as User,
} from '../../models/user';
import orderBy from 'lodash/orderBy';
import keyBy from 'lodash/keyBy';

const PM_PER_PAGE = 10;

export async function getUserInbox (user, options = {asArray: true, page: 0, conversation: null}) {
  if (typeof options.asArray === 'undefined') {
    options.asArray = true;
  }

  const findObj = {ownerId: user._id};

  if (options.conversation) {
    findObj.$or = [{ uuid: options.conversation }, { uuid: user._id }];
  }

  let query = Inbox
    .find(findObj)
    .sort({timestamp: -1});

  if (typeof options.page !== 'undefined') {
    query = query
      .limit(PM_PER_PAGE)
      .skip(PM_PER_PAGE * Number(options.page));
  }

  const messages = (await query.exec()).map(msg => msg.toJSON());

  if (options.asArray) {
    return messages;
  } else {
    const messagesObj = {};
    messages.forEach(msg => messagesObj[msg._id] = msg);

    return messagesObj;
  }
}

export async function listConversations (user) {
  let query = Inbox
    .aggregate([
      {
        $match: {
          ownerId: user._id,
        },
      },
      {
        $group: {
          _id: '$uuid',
          timestamp: {$max: '$timestamp'}, // sort before group doesn't work - use the max value to sort it again after
        },
      },
    ]);

  const conversationsList = orderBy(await query.exec(), ['timestamp'], ['desc']);
  const userList = conversationsList.map(c => c._id);

  const users = await User.find({_id: {$in: userList}})
    .select('_id profile.name auth.local.username')
    .lean()
    .exec();

  const usersMap = keyBy(users, '_id');
  const conversations = conversationsList.map(({_id, timestamp}) => ({
    uuid: usersMap[_id]._id,
    user: usersMap[_id].profile.name,
    username: usersMap[_id].auth.local.username,
    timestamp,
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
