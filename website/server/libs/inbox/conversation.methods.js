import { inboxModel as Inbox, setUserStyles } from '../../models/message';
import { model as User } from '../../models/user';

/**
 * Get the current user (avatar/setting etc) for conversations
 * @param users
 * @returns {Promise<void>}
 */
async function usersMapByConversations (users) {
  const usersMap = {};

  const usersQuery = {
    _id: { $in: users },
  };

  const loadedUsers = await User.find(usersQuery, {
    _id: 1,
    contributor: 1,
    backer: 1,
    items: 1,
    preferences: 1,
    stats: 1,
    flags: 1,
    inbox: 1,
  }).exec();

  for (const usr of loadedUsers) {
    const loadedUserConversation = {
      _id: usr._id,
      backer: usr.backer,
      contributor: usr.contributor,
      optOut: usr.inbox.optOut,
      blocks: usr.inbox.blocks || [],
    };
    // map user values to conversation properties
    setUserStyles(loadedUserConversation, usr);

    usersMap[usr._id] = loadedUserConversation;
  }

  return usersMap;
}

const CONVERSATION_PER_PAGE = 10;

export async function listConversations (owner, page) {
  const aggregateQuery = [
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
  ];

  if (page >= 0) {
    aggregateQuery.push({ $skip: page * CONVERSATION_PER_PAGE });
    aggregateQuery.push({ $limit: CONVERSATION_PER_PAGE });
  }

  // group messages by user owned by logged-in user
  const query = Inbox
    .aggregate(aggregateQuery);

  const conversationsList = await query.exec();

  const userIdList = conversationsList.map(c => c._id);

  // get user-info based on conversations
  const usersMap = await usersMapByConversations(userIdList);

  const conversations = conversationsList.map(res => {
    const uuid = res._id;

    const conversation = {
      uuid,
      ...res,
    };

    if (usersMap[uuid]) {
      const user = usersMap[uuid];

      conversation.userStyles = user.userStyles;
      conversation.contributor = user.contributor;
      conversation.backer = user.backer;

      const isOwnerBlocked = user.blocks.includes(owner._id);

      conversation.canReceive = !(user.optOut || isOwnerBlocked) || owner.hasPermission('moderator');
    }

    return conversation;
  });

  return conversations;
}
