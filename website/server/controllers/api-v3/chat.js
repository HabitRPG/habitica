import moment from 'moment';
import nconf from 'nconf';
import { authWithHeaders } from '../../middlewares/auth';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import {
  chatModel as Chat,
  sanitizeText as sanitizeMessageText,
} from '../../models/message';
import common from '../../../common';
import {
  BadRequest,
  NotFound,
  NotAuthorized,
} from '../../libs/errors';
import { removeFromArray } from '../../libs/collectionManipulators';
import { getUserInfo, getGroupUrl, sendTxn } from '../../libs/email';
import * as slack from '../../libs/slack';
import { chatReporterFactory } from '../../libs/chatReporting/chatReporterFactory';
import { getAuthorEmailFromMessage } from '../../libs/chat';
import bannedWords from '../../libs/bannedWords';
import { getMatchesByWordArray } from '../../libs/stringUtils';
import bannedSlurs from '../../libs/bannedSlurs';
import apiError from '../../libs/apiError';
import highlightMentions from '../../libs/highlightMentions';
import { getAnalyticsServiceByEnvironment } from '../../libs/analyticsService';

const analytics = getAnalyticsServiceByEnvironment();

const ACCOUNT_MIN_CHAT_AGE = Number(nconf.get('ACCOUNT_MIN_CHAT_AGE'));
const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map(email => ({ email, canSend: true }));

/**
 * @apiDefine MessageNotFound
 * @apiError (404) {NotFound} MessageNotFound The specified message could not be found.
 */

/**
 * @apiDefine GroupIdRequired
 * @apiError (400) {badRequest} groupIdRequired A group ID is required
 */

/**
 * @apiDefine ChatIdRequired
 * @apiError (400) {badRequest} chatIdRequired A chat ID is required
 */

/**
 * @apiDefine MessageIdRequired
 * @apiError (400) {badRequest} messageIdRequired A message ID is required
 */

const api = {};

function textContainsBannedSlur (message) {
  const bannedSlursMatched = getMatchesByWordArray(message, bannedSlurs);
  return bannedSlursMatched.length > 0;
}

/**
 * @api {get} /api/v3/groups/:groupId/chat Get chat messages from a group
 * @apiName GetChat
 * @apiGroup Chat
 * @apiDescription Fetches an array of messages from a group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and
 *                                   'habitrpg' for tavern are accepted).
 *
 * @apiSuccess {Array} data An array of <a href='https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js#L51' target='_blank'>chat messages</a>
 *
 * @apiUse GroupNotFound
 * @apiUse GroupIdRequired
 */
api.getChat = {
  method: 'GET',
  url: '/groups/:groupId/chat',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { groupId } = req.params;
    const group = await Group.getGroup({ user, groupId, fields: 'chat' });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    const groupChat = await Group.toJSONCleanChat(group, user);
    res.respond(200, groupChat.chat);
  },
};

function getBannedWordsFromText (message) {
  return getMatchesByWordArray(message, bannedWords);
}

/**
 * @api {post} /api/v3/groups/:groupId/chat Post chat message to a group
 * @apiName PostChat
 * @apiGroup Chat
 * @apiDescription Posts a chat message to a group
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted)
 * @apiParam (Body) {String} message Message The message to post
 * @apiParam (Query) {UUID} previousMsg The previous chat message's UUID which will
 *                                      force a return of the full group chat.
 *
 * @apiUse GroupNotFound
 * @apiUse GroupIdRequired
 * @apiError (400) {NotAuthorized} chatPriviledgesRevoked You cannot do that because
 *                                                        your chat privileges have been revoked.
 */
api.postChat = {
  method: 'POST',
  url: '/groups/:groupId/chat',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { groupId } = req.params;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();
    req.sanitize('message').trim();
    req.checkBody('message', res.t('messageGroupChatBlankMessage')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    const { purchased } = group;
    const isUpgraded = purchased && purchased.plan && purchased.plan.customerId
      && (!purchased.plan.dateTerminated || moment().isBefore(purchased.plan.dateTerminated));

    if (group.type !== 'party' && !isUpgraded) {
      throw new BadRequest(res.t('featureRetired'));
    }

    // Check message for banned slurs
    if (group && group.privacy !== 'private' && textContainsBannedSlur(req.body.message)) {
      const { message } = req.body;
      user.flags.chatRevoked = true;
      await user.save();

      // Email the mods
      const authorEmail = getUserInfo(user, ['email']).email;
      const groupUrl = getGroupUrl(group);

      const report = [
        { name: 'MESSAGE_TIME', content: (new Date()).toString() },
        { name: 'MESSAGE_TEXT', content: message },

        { name: 'AUTHOR_USERNAME', content: user.profile.name },
        { name: 'AUTHOR_UUID', content: user._id },
        { name: 'AUTHOR_EMAIL', content: authorEmail },
        { name: 'AUTHOR_MODAL_URL', content: `/profile/${user._id}` },

        { name: 'GROUP_NAME', content: group.name },
        { name: 'GROUP_TYPE', content: group.type },
        { name: 'GROUP_ID', content: group._id },
        { name: 'GROUP_URL', content: groupUrl },
      ];

      sendTxn(FLAG_REPORT_EMAILS, 'slur-report-to-mods', report);

      // Slack the mods
      slack.sendSlurNotification({
        authorEmail,
        author: user,
        group,
        message,
      });

      throw new BadRequest(res.t('bannedSlurUsed'));
    }

    if (group.privacy === 'public' && user.flags.chatRevoked) {
      throw new NotAuthorized(res.t('chatPrivilegesRevoked'));
    }

    // prevent banned words being posted, except in private guilds/parties
    // and in certain public guilds with specific topics
    if (group.privacy === 'public' && !group.bannedWordsAllowed) {
      const matchedBadWords = getBannedWordsFromText(req.body.message);
      if (matchedBadWords.length > 0) {
        throw new BadRequest(res.t('bannedWordUsed', { swearWordsUsed: matchedBadWords.join(', ') }));
      }
    }

    const chatRes = await Group.toJSONCleanChat(group, user);
    const lastClientMsg = req.query.previousMsg;
    const chatUpdated = !!(
      lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg
    );

    if (group.checkChatSpam(user)) {
      throw new NotAuthorized(res.t('messageGroupChatSpam'));
    }

    // Check if account is newer than the minimum age for chat participation
    if (moment().diff(user.auth.timestamps.created, 'minutes') < ACCOUNT_MIN_CHAT_AGE) {
      analytics.track('chat age error', {
        uuid: user._id,
        hitType: 'event',
        category: 'behavior',
        headers: req.headers,
      });
      throw new BadRequest(res.t('chatTemporarilyUnavailable'));
    }

    const sanitizedMessageText = sanitizeMessageText(req.body.message);
    const [message, mentions, mentionedMembers] = await highlightMentions(sanitizedMessageText);
    let client = req.headers['x-client'] || '3rd Party';
    if (client) {
      client = client.replace('habitica-', '');
    }

    let flagCount = 0;
    if (group.privacy === 'public' && user.flags.chatShadowMuted) {
      flagCount = common.constants.CHAT_FLAG_FROM_SHADOW_MUTE;

      // Email the mods
      const authorEmail = getUserInfo(user, ['email']).email;
      const groupUrl = getGroupUrl(group);

      const report = [
        { name: 'MESSAGE_TIME', content: (new Date()).toString() },
        { name: 'MESSAGE_TEXT', content: message },

        { name: 'AUTHOR_USERNAME', content: user.profile.name },
        { name: 'AUTHOR_UUID', content: user._id },
        { name: 'AUTHOR_EMAIL', content: authorEmail },
        { name: 'AUTHOR_MODAL_URL', content: `/profile/${user._id}` },

        { name: 'GROUP_NAME', content: group.name },
        { name: 'GROUP_TYPE', content: group.type },
        { name: 'GROUP_ID', content: group._id },
        { name: 'GROUP_URL', content: groupUrl },
      ];

      sendTxn(FLAG_REPORT_EMAILS, 'shadow-muted-post-report-to-mods', report);

      // Slack the mods
      slack.sendShadowMutedPostNotification({
        authorEmail,
        author: user,
        group,
        message,
      });
    }

    const newChatMessage = group.sendChat({
      message,
      user,
      flagCount,
      metaData: null,
      client,
      translate: res.t,
      mentions,
      mentionedMembers,
    });
    const toSave = [newChatMessage.save()];

    if (group.type === 'party') {
      user.party.lastMessageSeen = newChatMessage.id;
      toSave.push(user.save());
    }

    await Promise.all(toSave);

    const analyticsObject = {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      groupType: group.type,
      privacy: group.privacy,
      headers: req.headers,
    };

    if (mentions) {
      analyticsObject.mentionsCount = mentions.length;
    } else {
      analyticsObject.mentionsCount = 0;
    }
    if (group.privacy === 'public') {
      analyticsObject.groupName = group.name;
    }

    res.analytics.track('group chat', analyticsObject);

    if (chatUpdated) {
      res.respond(200, { chat: chatRes.chat });
    } else {
      res.respond(200, { message: newChatMessage });
    }
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/chat/:chatId/like Like a group chat message
 * @apiName LikeChat
 * @apiGroup Chat
 * @apiDescription Likes a chat message from a group
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted).
 * @apiParam (Path) {UUID} chatId The chat message _id
 *
 * @apiSuccess {Object} data The liked <a href='https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js#L51' target='_blank'>chat message</a>
 *
 * @apiUse GroupNotFound
 * @apiUse MessageNotFound
 * @apiUse GroupIdRequired
 * @apiUse ChatIdRequired
 * @apiError (400) {NotFound} messageGroupChatLikeOwnMessage A user can't like their own message
 */
api.likeChat = {
  method: 'POST',
  url: '/groups/:groupId/chat/:chatId/like',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { groupId } = req.params;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();
    req.checkParams('chatId', apiError('chatIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    const message = await Chat.findOne({ _id: req.params.chatId }).exec();
    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));
    // @TODO correct this error type
    if (message.uuid === user._id) throw new NotFound(res.t('messageGroupChatLikeOwnMessage'));

    if (!message.likes) message.likes = {};
    message.likes[user._id] = !message.likes[user._id];
    message.markModified('likes');
    await message.save();

    res.respond(200, message); // TODO what if the message is flagged and shouldn't be returned?
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/chat/:chatId/flag Flag a group chat message
 * @apiDescription A message will be hidden from chat if two or more users flag a message.
 * It will be hidden immediately if a moderator flags the message.
 * An email is sent to the moderators about every flagged message.
 * @apiName FlagChat
 * @apiGroup Chat
 *
 * @apiParam (Path) {UUID} groupId The group id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted)
 * @apiParam (Path) {UUID} chatId The chat message id
 * @apiParam (Body) {String} [comment] explain why the message was flagged
 *
 * @apiSuccess {Object} data The flagged chat message
 * @apiSuccess {UUID} data.id The id of the message
 * @apiSuccess {String} data.text The text of the message
 * @apiSuccess {Number} data.timestamp The timestamp of the message in milliseconds
 * @apiSuccess {Object} data.likes The likes of the message
 * @apiSuccess {Object} data.flags The flags of the message
 * @apiSuccess {Number} data.flagCount The number of flags the message has
 * @apiSuccess {UUID} data.uuid The User ID of the author of the message
 * @apiSuccess {String} data.user The username of the author of the message
 *
 * @apiUse GroupNotFound
 * @apiUse MessageNotFound
 * @apiUse GroupIdRequired
 * @apiUse ChatIdRequired
 * @apiError (404) {NotFound} AlreadyFlagged Chat messages cannot be flagged
                                             more than once by a user
 * @apiError (404) {NotFound} messageGroupChatFlagAlreadyReported The message
                                                                  has already been flagged.
 */
api.flagChat = {
  method: 'POST',
  url: '/groups/:groupId/chat/:chatId/flag',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const chatReporter = chatReporterFactory('Group', req, res);
    const message = await chatReporter.flag();
    res.respond(200, message);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/chat/:chatId/clearflags Clear flags
 * @apiDescription Resets the flag count on a chat message.
 * Retains the id of the user's that have flagged the message. (Only visible to moderators)
 * @apiPermission Admin
 * @apiName ClearFlags
 * @apiGroup Chat
 *
 * @apiParam (Path) {UUID} groupId The group id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted)
 * @apiParam (Path) {UUID} chatId The chat message id
 *
 * @apiSuccess {Object} data An empty object
 *
 * @apiUse GroupNotFound
 * @apiUse MessageNotFound
 * @apiUse GroupIdRequired
 * @apiUse ChatIdRequired
 * @apiError (404) {NotAuthorized} MustBeAdmin Must be a moderator to use this route
 */
api.clearChatFlags = {
  method: 'Post',
  url: '/groups/:groupId/chat/:chatId/clearflags',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { groupId } = req.params;
    const { chatId } = req.params;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();
    req.checkParams('chatId', apiError('chatIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    if (!user.hasPermission('moderator')) {
      throw new NotAuthorized(res.t('messageGroupChatAdminClearFlagCount'));
    }

    const group = await Group.getGroup({
      user,
      groupId,
      optionalMembership: user.hasPermission('moderator'),
    });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    const message = await Chat.findOne({ _id: chatId }).exec();
    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));

    message.flagCount = 0;
    await message.save();

    const adminEmailContent = getUserInfo(user, ['email']).email;
    const authorEmail = getAuthorEmailFromMessage(message);
    const groupUrl = getGroupUrl(group);

    sendTxn(FLAG_REPORT_EMAILS, 'unflag-report-to-mods', [
      { name: 'MESSAGE_TIME', content: (new Date(message.timestamp)).toString() },
      { name: 'MESSAGE_TEXT', content: message.text },

      { name: 'ADMIN_USERNAME', content: user.profile.name },
      { name: 'ADMIN_UUID', content: user._id },
      { name: 'ADMIN_EMAIL', content: adminEmailContent },
      { name: 'ADMIN_MODAL_URL', content: `/profile/${user._id}` },

      { name: 'AUTHOR_USERNAME', content: message.user },
      { name: 'AUTHOR_UUID', content: message.uuid },
      { name: 'AUTHOR_EMAIL', content: authorEmail },
      { name: 'AUTHOR_MODAL_URL', content: `/profile/${message.uuid}` },

      { name: 'GROUP_NAME', content: group.name },
      { name: 'GROUP_TYPE', content: group.type },
      { name: 'GROUP_ID', content: group._id },
      { name: 'GROUP_URL', content: groupUrl },
    ]);

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/chat/seen Mark all messages as read for a group
 * @apiName SeenChat
 * @apiGroup Chat
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted)
 *
 * @apiSuccess {Object} data An empty object
 * @apiUse GroupIdRequired
 */
api.seenChat = {
  method: 'POST',
  url: '/groups/:groupId/chat/seen',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { groupId } = req.params;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    // Do not validate group existence,
    // it doesn't really matter and make it works if the group gets deleted
    // let group = await Group.getGroup({user, groupId});
    // if (!group) throw new NotFound(res.t('groupNotFound'));

    const update = {
      $unset: {},
      $pull: {},
    };
    update.$unset[`newMessages.${groupId}`] = true;

    update.$pull.notifications = {
      type: 'NEW_CHAT_MESSAGE',
      'data.group.id': groupId,
    };

    // Remove from response
    user.notifications = user.notifications.filter(n => {
      if (n && n.type === 'NEW_CHAT_MESSAGE' && n.data && n.data.group && n.data.group.id === groupId) {
        return false;
      }

      return true;
    });

    // Update the user version field manually,
    // it cannot be updated in the pre update hook
    // See https://github.com/HabitRPG/habitica/pull/9321#issuecomment-354187666 for more info
    user._v += 1;

    await User.update({ _id: user._id }, update).exec();
    res.respond(200, {});
  },
};

/**
 * @api {delete} /api/v3/groups/:groupId/chat/:chatId Delete chat message from a group
 * @apiName DeleteChat
 * @apiGroup Chat
 * @apiDescription Delete's a chat message from a group
 *
 * @apiParam (Query) {UUID} previousMsg The last message's ID fetched by the
 *                                      client so that the whole chat will be returned only
 *                                      if new messages have been posted in the meantime.
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg'
 *                                 for tavern are accepted).
 * @apiParam (Path) {UUID} chatId The chat message id
 *
 * @apiSuccess data The updated chat array or an empty object if no message was posted
 *                  after previousMsg.
 * @apiSuccess {Object} data An empty object when the previous message was deleted
 *
 * @apiUse GroupNotFound
 * @apiUse MessageNotFound
 * @apiUse GroupIdRequired
 * @apiUse ChatIdRequired
 * @apiError (400) onlyCreatorOrAdminCanDeleteChat Only the creator of the message and admins
                                                   can delete a chat message.
 */
api.deleteChat = {
  method: 'DELETE',
  url: '/groups/:groupId/chat/:chatId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { groupId } = req.params;
    const { chatId } = req.params;

    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty();
    req.checkParams('chatId', apiError('chatIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const group = await Group.getGroup({ user, groupId, fields: 'chat' });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    const message = await Chat.findOne({ _id: chatId }).exec();
    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));

    if (user._id !== message.uuid && !user.hasPermission('moderator')) {
      throw new NotAuthorized(res.t('onlyCreatorOrAdminCanDeleteChat'));
    }

    const chatRes = await Group.toJSONCleanChat(group, user);
    const lastClientMsg = req.query.previousMsg;
    const chatUpdated = !!(
      lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg
    );

    await Chat.remove({ _id: message._id }).exec();

    if (chatUpdated) {
      removeFromArray(chatRes.chat, { id: chatId });
      res.respond(200, chatRes.chat);
    } else {
      res.respond(200, {});
    }
  },
};

export default api;
