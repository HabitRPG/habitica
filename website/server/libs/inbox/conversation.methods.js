import { inboxModel as Inbox, setUserStyles } from '../../models/message';
import { model as User } from '../../models/user';

/**
 * Get the users for conversations
 * 1. Get the user data of last sent message by conversation
 * 2. If the target user hasn't replied yet ( 'sent:true' ) , list user data by users directly
 * @param owner
 * @param users
 * @returns {Promise<void>}
 */
async function usersMapByConversations (owner, users) {
  const query = Inbox
    .aggregate([
      {
        $match: {
          ownerId: owner._id,
          uuid: { $in: users },
          sent: false, // only messages the other user sent to you
        },
      },
      {
        $group: {
          _id: '$uuid',
          userStyles: { $last: '$userStyles' },
          contributor: { $last: '$contributor' },
          backer: { $last: '$backer' },
        },
      },
    ]);


  const usersAr = await query.exec();
  const usersMap = {};

  for (const usr of usersAr) {
    usersMap[usr._id] = usr;
  }

  // if a conversation doesn't have a response of the chat-partner,
  // those won't be listed by the query above
  const usersStillNeedToBeLoaded = users.filter(userId => !usersMap[userId]);

  if (usersStillNeedToBeLoaded.length > 0) {
    const usersQuery = {
      _id: { $in: usersStillNeedToBeLoaded },
    };

    const loadedUsers = await User.find(usersQuery, {
      _id: 1,
      contributor: 1,
      backer: 1,
      items: 1,
      preferences: 1,
      stats: 1,
    }).exec();

    for (const usr of loadedUsers) {
      const loadedUserConversation = {
        _id: usr._id,
        backer: usr.backer,
        contributor: usr.contributor,
      };
      // map user values to conversation properties
      setUserStyles(loadedUserConversation, usr);

      usersMap[usr._id] = loadedUserConversation;
    }
  }

  return usersMap;
}

export async function listConversations (owner) {
  // group messages by user owned by logged-in user
  const query = Inbox
    .aggregate([
      {
        $match: {
          ownerId: owner._id,
        },
      },
      {
        $group: {
          _id: '$uuid',
          user: { $last: '$user' },
          username: { $last: '$username' },
          timestamp: { $last: '$timestamp' },
          text: { $last: '$text' },
          count: { $sum: 1 },
        },
      },
      { $sort: { timestamp: -1 } }, // sort by latest message
    ]);

  const conversationsList = await query.exec();

  const userIdList = conversationsList.map(c => c._id);

  // get user-info based on conversations
  const usersMap = await usersMapByConversations(owner, userIdList);

  const conversations = conversationsList.map(res => {
    const uuid = res._id;

    const conversation = {
      uuid,
      ...res,
    };

    if (usersMap[uuid]) {
      conversation.userStyles = usersMap[uuid].userStyles;
      conversation.contributor = usersMap[uuid].contributor;
      conversation.backer = usersMap[uuid].backer;
    }

    return conversation;
  });

  return conversations;
}
