import { authWithHeaders } from '../../middlewares/auth';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import {
  BadRequest,
  NotFound,
  NotAuthorized,
} from '../../libs/errors';
import _ from 'lodash';
import { removeFromArray } from '../../libs/collectionManipulators';
import { getUserInfo, getGroupUrl, sendTxn } from '../../libs/email';
import slack from '../../libs/slack';
import pusher from '../../libs/pusher';
import nconf from 'nconf';
import Bluebird from 'bluebird';
import bannedWords from '../../libs/bannedWords';
import guildsAllowingBannedWords from '../../libs/guildsAllowingBannedWords';
import { getMatchesByWordArray } from '../../libs/stringUtils';
import bannedSlurs from '../../libs/bannedSlurs';

const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS:COMMUNITY_MANAGER_EMAIL');
const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map((email) => {
  return { email, canSend: true };
});

/**
 * @apiDefine MessageNotFound
 * @apiError (404) {NotFound} MessageNotFound The specified message could not be found.
 */

/**
 * @apiDefine GroupIdRequired
 * @apiError (404) {badRequest} groupIdRequired A group ID is required
 */

/**
 * @apiDefine ChatIdRequired
 * @apiError (404) {badRequest} chatIdRequired A chat ID is required
 */

let api = {};

async function getAuthorEmailFromMessage (message) {
  let authorId = message.uuid;

  if (authorId === 'system') {
    return 'system';
  }

  let author = await User.findOne({_id: authorId}, {auth: 1}).exec();

  if (author) {
    return getUserInfo(author, ['email']).email;
  } else {
    return 'Author Account Deleted';
  }
}

function textContainsBannedSlur (message) {
  let bannedSlursMatched = getMatchesByWordArray(message, bannedSlurs);
  return bannedSlursMatched.length > 0;
}

/**
 * @api {get} /api/v3/groups/:groupId/chat Get chat messages from a group
 * @apiName GetChat
 * @apiGroup Chat
 * @apiDescription Fetches an array of messages from a group
 *
 * @apiParam (Path) {String} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
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
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: 'chat'});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    res.respond(200, Group.toJSONCleanChat(group, user).chat);
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
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 * @apiParam (Body) {String} message Message The message to post
 * @apiParam (Query) {UUID} previousMsg The previous chat message's UUID which will force a return of the full group chat
 *
 * @apiUse GroupNotFound
 * @apiUse GroupIdRequired
 * @apiError (400) {NotFound} ChatPriviledgesRevoked Your chat privileges have been revoked
 */
api.postChat = {
  method: 'POST',
  url: '/groups/:groupId/chat',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.params.groupId;
    let chatUpdated;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.sanitize('message').trim();
    req.checkBody('message', res.t('messageGroupChatBlankMessage')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId});

    // Check message for banned slurs
    if (textContainsBannedSlur(req.body.message)) {
      let message = req.body.message;
      user.flags.chatRevoked = true;
      await user.save();

      // Email the mods
      let authorEmail = getUserInfo(user, ['email']).email;
      let groupUrl = getGroupUrl(group);

      let report =  [
        {name: 'MESSAGE_TIME', content: (new Date()).toString()},
        {name: 'MESSAGE_TEXT', content: message},

        {name: 'AUTHOR_USERNAME', content: user.profile.name},
        {name: 'AUTHOR_UUID', content: user._id},
        {name: 'AUTHOR_EMAIL', content: authorEmail},
        {name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${user._id}`},

        {name: 'GROUP_NAME', content: group.name},
        {name: 'GROUP_TYPE', content: group.type},
        {name: 'GROUP_ID', content: group._id},
        {name: 'GROUP_URL', content: groupUrl},
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

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.privacy !== 'private' && user.flags.chatRevoked) {
      throw new NotAuthorized(res.t('chatPrivilegesRevoked'));
    }

    // prevent banned words being posted, except in private guilds/parties and in certain public guilds with specific topics
    if (group.privacy !== 'private' && !guildsAllowingBannedWords[group._id]) {
      let matchedBadWords = getBannedWordsFromText(req.body.message);
      if (matchedBadWords.length > 0) {
        // @TODO replace this split mechanism with something that works properly in translations
        let message = res.t('bannedWordUsed').split('.');
        message[0] += ` (${matchedBadWords.join(', ')})`;
        throw new BadRequest(message.join('.'));
      }
    }

    let lastClientMsg = req.query.previousMsg;
    chatUpdated = lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg ? true : false;

    if (group.checkChatSpam(user)) {
      throw new NotAuthorized(res.t('messageGroupChatSpam'));
    }

    let newChatMessage = group.sendChat(req.body.message, user);

    let toSave = [group.save()];

    if (group.type === 'party') {
      user.party.lastMessageSeen = group.chat[0].id;
      toSave.push(user.save());
    }

    let [savedGroup] = await Bluebird.all(toSave);

    // realtime chat is only enabled for private groups (for now only for parties)
    if (savedGroup.privacy === 'private' && savedGroup.type === 'party') {
      // req.body.pusherSocketId is sent from official clients to identify the sender user's real time socket
      // see https://pusher.com/docs/server_api_guide/server_excluding_recipients
      pusher.trigger(`presencegroup${savedGroup._id}`, 'newchat', newChatMessage, req.body.pusherSocketId);
    }

    if (chatUpdated) {
      res.respond(200, {chat: Group.toJSONCleanChat(savedGroup, user).chat});
    } else {
      res.respond(200, {message: savedGroup.chat[0]});
    }

    group.sendGroupChatReceivedWebhooks(newChatMessage);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/chat/:chatId/like Like a group chat message
 * @apiName LikeChat
 * @apiGroup Chat
 * @apiDescription Likes a chat message from a group
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
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
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('chatId', res.t('chatIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let message = _.find(group.chat, {id: req.params.chatId});
    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));
    // TODO correct this error type
    if (message.uuid === user._id) throw new NotFound(res.t('messageGroupChatLikeOwnMessage'));

    let update = {$set: {}};

    if (!message.likes) message.likes = {};

    message.likes[user._id] = !message.likes[user._id];
    update.$set[`chat.$.likes.${user._id}`] = message.likes[user._id];

    await Group.update(
      {_id: group._id, 'chat.id': message.id},
      update
    ).exec();
    res.respond(200, message); // TODO what if the message is flagged and shouldn't be returned?
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/chat/:chatId/flag Flag a group chat message
 * @apiDescription A message will be hidden from chat if two or more users flag a message. It will be hidden immediately if a moderator flags the message. An email is sent to the moderators about every flagged message.
 * @apiName FlagChat
 * @apiGroup Chat
 *
 * @apiParam (Path) {UUID} groupId The group id ('party' for the user party and 'habitrpg' for tavern are accepted)
 * @apiParam (Path) {UUID} chatId The chat message id
 *
 * @apiSuccess {Object} data The flagged chat message
 * @apiSuccess {UUID} data.id The id of the message
 * @apiSuccess {String} data.text The text of the message
 * @apiSuccess {Number} data.timestamp The timestamp of the message in milliseconds
 * @apiSuccess {Object} data.likes The likes of the message
 * @apiSuccess {Object} data.flags The flags of the message
 * @apiSuccess {Number} data.flagCount The number of flags the message has
 * @apiSuccess {UUID} data.uuid The user id of the author of the message
 * @apiSuccess {String} data.user The username of the author of the message
 *
 * @apiUse GroupNotFound
 * @apiUse MessageNotFound
 * @apiUse GroupIdRequired
 * @apiUse ChatIdRequired
 * @apiError (404) {NotFound} AlreadyFlagged Chat messages cannot be flagged more than once by a user
 * @apiError (404) {NotFound} messageGroupChatFlagAlreadyReported The message has already been flagged
 */
api.flagChat = {
  method: 'POST',
  url: '/groups/:groupId/chat/:chatId/flag',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.params.groupId;
    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('chatId', res.t('chatIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({
      user,
      groupId,
      optionalMembership: user.contributor.admin,
    });
    if (!group) throw new NotFound(res.t('groupNotFound'));
    let message = _.find(group.chat, {id: req.params.chatId});

    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));
    if (message.uuid === 'system') throw new BadRequest(res.t('messageCannotFlagSystemMessages', {communityManagerEmail: COMMUNITY_MANAGER_EMAIL}));
    let update = {$set: {}};

    // Log user ids that have flagged the message
    if (!message.flags) message.flags = {};
    // TODO fix error type
    if (message.flags[user._id] && !user.contributor.admin) throw new NotFound(res.t('messageGroupChatFlagAlreadyReported'));
    message.flags[user._id] = true;
    update.$set[`chat.$.flags.${user._id}`] = true;

    // Log total number of flags (publicly viewable)
    if (!message.flagCount) message.flagCount = 0;
    if (user.contributor.admin) {
      // Arbitrary amount, higher than 2
      message.flagCount = 5;
    } else {
      message.flagCount++;
    }
    update.$set['chat.$.flagCount'] = message.flagCount;

    await Group.update(
      {_id: group._id, 'chat.id': message.id},
      update
    ).exec();

    let reporterEmailContent = getUserInfo(user, ['email']).email;
    let authorEmail = await getAuthorEmailFromMessage(message);
    let groupUrl = getGroupUrl(group);

    sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods', [
      {name: 'MESSAGE_TIME', content: (new Date(message.timestamp)).toString()},
      {name: 'MESSAGE_TEXT', content: message.text},

      {name: 'REPORTER_USERNAME', content: user.profile.name},
      {name: 'REPORTER_UUID', content: user._id},
      {name: 'REPORTER_EMAIL', content: reporterEmailContent},
      {name: 'REPORTER_MODAL_URL', content: `/static/front/#?memberId=${user._id}`},

      {name: 'AUTHOR_USERNAME', content: message.user},
      {name: 'AUTHOR_UUID', content: message.uuid},
      {name: 'AUTHOR_EMAIL', content: authorEmail},
      {name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${message.uuid}`},

      {name: 'GROUP_NAME', content: group.name},
      {name: 'GROUP_TYPE', content: group.type},
      {name: 'GROUP_ID', content: group._id},
      {name: 'GROUP_URL', content: groupUrl},
    ]);

    slack.sendFlagNotification({
      authorEmail,
      flagger: user,
      group,
      message,
    });

    res.respond(200, message);
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/chat/:chatId/clearflags Clear flags
 * @apiDescription Resets the flag count on a chat message. Retains the id of the user's that have flagged the message. (Only visible to moderators)
 * @apiPermission Admin
 * @apiName ClearFlags
 * @apiGroup Chat
 *
 * @apiParam (Path) {UUID} groupId The group id ('party' for the user party and 'habitrpg' for tavern are accepted)
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
    let user = res.locals.user;
    let groupId = req.params.groupId;
    let chatId = req.params.chatId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('chatId', res.t('chatIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    if (!user.contributor.admin) {
      throw new NotAuthorized(res.t('messageGroupChatAdminClearFlagCount'));
    }

    let group = await Group.getGroup({
      user,
      groupId,
      optionalMembership: user.contributor.admin,
    });
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let message = _.find(group.chat, {id: chatId});
    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));

    message.flagCount = 0;

    await Group.update(
      {_id: group._id, 'chat.id': message.id},
      {$set: {'chat.$.flagCount': message.flagCount}}
    ).exec();

    let adminEmailContent = getUserInfo(user, ['email']).email;
    let authorEmail = getAuthorEmailFromMessage(message);
    let groupUrl = getGroupUrl(group);

    sendTxn(FLAG_REPORT_EMAILS, 'unflag-report-to-mods', [
      {name: 'MESSAGE_TIME', content: (new Date(message.timestamp)).toString()},
      {name: 'MESSAGE_TEXT', content: message.text},

      {name: 'ADMIN_USERNAME', content: user.profile.name},
      {name: 'ADMIN_UUID', content: user._id},
      {name: 'ADMIN_EMAIL', content: adminEmailContent},
      {name: 'ADMIN_MODAL_URL', content: `/static/front/#?memberId=${user._id}`},

      {name: 'AUTHOR_USERNAME', content: message.user},
      {name: 'AUTHOR_UUID', content: message.uuid},
      {name: 'AUTHOR_EMAIL', content: authorEmail},
      {name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${message.uuid}`},

      {name: 'GROUP_NAME', content: group.name},
      {name: 'GROUP_TYPE', content: group.type},
      {name: 'GROUP_ID', content: group._id},
      {name: 'GROUP_URL', content: groupUrl},
    ]);

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/groups/:groupId/chat/seen Mark all messages as read for a group
 * @apiName SeenChat
 * @apiGroup Chat
 *
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 *
 * @apiSuccess {Object} data An empty object
 * @apiUse GroupIdRequired
 */
api.seenChat = {
  method: 'POST',
  url: '/groups/:groupId/chat/seen',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    // Do not validate group existence, it doesn't really matter and make it works if the group gets deleted
    // let group = await Group.getGroup({user, groupId});
    // if (!group) throw new NotFound(res.t('groupNotFound'));

    let update = {$unset: {}};
    update.$unset[`newMessages.${groupId}`] = true;

    await User.update({_id: user._id}, update).exec();
    res.respond(200, {});
  },
};

/**
 * @api {delete} /api/v3/groups/:groupId/chat/:chatId Delete chat message from a group
 * @apiName DeleteChat
 * @apiGroup Chat
 * @apiDescription Delete's a chat message from a group
 *
 * @apiParam (Query) {UUID} previousMsg The last message's ID fetched by the client so that the whole chat will be returned only if new messages have been posted in the meantime
 * @apiParam (Path) {UUID} groupId The group _id ('party' for the user party and 'habitrpg' for tavern are accepted)
 * @apiParam (Path) {UUID} chatId The chat message id
 *
 * @apiSuccess data The updated chat array or an empty object if no message was posted after previousMsg
 * @apiSuccess {Object} data An empty object when the previous message was deleted
 *
 * @apiUse GroupNotFound
 * @apiUse MessageNotFound
 * @apiUse GroupIdRequired
 * @apiUse ChatIdRequired
 * @apiError (400) onlyCreatorOrAdminCanDeleteChat Only the creator of the message and admins can delete a chat message
 */
api.deleteChat = {
  method: 'DELETE',
  url: '/groups/:groupId/chat/:chatId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.params.groupId;
    let chatId = req.params.chatId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('chatId', res.t('chatIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup({user, groupId, fields: 'chat'});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let message = _.find(group.chat, {id: chatId});
    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));

    if (user._id !== message.uuid && !user.contributor.admin) {
      throw new NotAuthorized(res.t('onlyCreatorOrAdminCanDeleteChat'));
    }

    let lastClientMsg = req.query.previousMsg;
    let chatUpdated = lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg ? true : false;

    await Group.update(
      {_id: group._id},
      {$pull: {chat: {id: chatId}}}
    ).exec();

    if (chatUpdated) {
      let chatRes = Group.toJSONCleanChat(group, user).chat;
      removeFromArray(chatRes, {id: chatId});
      res.respond(200, chatRes);
    } else {
      res.respond(200, {});
    }
  },
};

module.exports = api;
