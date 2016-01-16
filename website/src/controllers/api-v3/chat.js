import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import {
  NotFound,
} from '../../libs/api-v3/errors';
import _ from 'lodash';
import { sendTxn } from '../../libs/api-v3/email';
import nconf    from 'nconf';

let api = {};

/**
 * @api {get} /groups/:groupId/chat Get chat messages from a group
 * @apiVersion 3.0.0
 * @apiName GetChat
 * @apiGroup Chat
 *
 * @apiParam {string} groupId The group _id (or 'party')
 *
 * @apiSuccess {Array} chat An array of chat messages
 */
api.getChat = {
  method: 'GET',
  url: '/groups/:groupId/chat',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup(user, req.params.groupId, 'chat');
    if (!group) throw new NotFound(res.t('groupNotFound'));

    res.respond(200, group.chat);
  },
};

/**
 * @api {post} /groups/:groupId/chat Post chat message to a group
 * @apiVersion 3.0.0
 * @apiName PostCat
 * @apiGroup Chat
 *
 * @apiParam {UUID} groupId The group _id
 * @apiParam {message} message The chat's message
 * @apiParam {previousMsg} previousMsg The previous chat message which will force a return of the full group chat
 *
 * @apiSuccess {Array} chat An array of chat messages
 */
api.postChat = {
  method: 'POST',
  url: '/groups/:groupId/chat',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.params.groupId;
    let chatUpdated;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkBody('message', res.t('messageGroupChatBlankMessage')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup(user, groupId);

    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (group.type !== 'party' && user.flags.chatRevoked) {
      throw new NotFound('Your chat privileges have been revoked.');
    }

    let lastClientMsg = req.query.previousMsg;
    chatUpdated = lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg ? true : false;

    group.sendChat(req.body.message, user);

    if (group.type === 'party') {
      user.party.lastMessageSeen = group.chat[0].id;
      user.save(); // TODO why this is non-blocking? must catch?
    }

    let savedGroup = await group.save();
    if (chatUpdated) {
      res.respond(200, {chat: savedGroup.chat});
    } else {
      res.respond(200, {message: savedGroup.chat[0]});
    }
  },
};

/**
 * @api {post} /groups/:groupId/chat/:chatId/like Like a group chat message
 * @apiVersion 3.0.0
 * @apiName LikeChat
 * @apiGroup Chat
 *
 * @apiParam {groupId} groupId The group _id
 * @apiParam {chatId} chatId The chat message _id
 *
 * @apiSuccess {Array} chat An array of chat messages
 */
api.likeChat = {
  method: 'Post',
  url: '/groups/:groupId/chat/:chatId/like',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('chatId', res.t('chatIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup(user, groupId);
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let message = _.find(group.chat, {id: req.params.chatId});
    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));
    if (message.uuid === user._id) throw new NotFound(res.t('messageGroupChatLikeOwnMessage'));

    let update = {$set: {}};

    if (!message.likes) message.likes = {};

    message.likes[user._id] = !message.likes[user._id];
    update.$set[`chat.$.likes.${user._id}`] = message.likes[user._id];

    await Group.update(
      {_id: group._id, 'chat.id': message.id},
      update
    );
    res.respond(200, message);
  },
};

/**
 * @api {post} /groups/:groupId/chat/:chatId/like Like a group chat message
 * @apiVersion 3.0.0
 * @apiName LikeChat
 * @apiGroup Chat
 *
 * @apiParam {groupId} groupId The group _id
 * @apiParam {chatId} chatId The chat message _id
 *
 * @apiSuccess {Array} chat An array of chat messages
 */
api.flagChat = {
  method: 'Post',
  url: '/groups/:groupId/chat/:chatId/flag',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    let user = res.locals.user;
    let groupId = req.params.groupId;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('chatId', res.t('chatIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let group = await Group.getGroup(user, groupId);
    if (!group) throw new NotFound(res.t('groupNotFound'));
    let message = _.find(group.chat, {id: req.params.chatId});

    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));

    if (message.uuid === user._id) throw new NotFound(res.t('messageGroupChatFlagOwnMessage'));

    let author = await User.findOne({_id: message.uuid}, {auth: 1});

    let update = {$set: {}};

    // Log user ids that have flagged the message
    if (!message.flags) message.flags = {};
    if (message.flags[user._id] && !user.contributor.admin) throw new NotFound(res.t('messageGroupChatFlagAlreadyReported'));
    message.flags[user._id] = true;
    update.$set[`chat.$.flags.${user._id}`] = true;

    // Log total number of flags (publicly viewable)
    if (!message.flagCount) message.flagCount = 0;
    if (user.contributor.admin) {
      // Arbitraty amount, higher than 2
      message.flagCount = 5;
    } else {
      message.flagCount++;
    }
    update.$set['chat.$.flagCount'] = message.flagCount;

    await Group.update(
      {_id: group._id, 'chat.id': message.id},
      update
    );

    let addressesToSendTo = nconf.get('FLAG_REPORT_EMAIL');
    addressesToSendTo = typeof addressesToSendTo === 'string' ? JSON.parse(addressesToSendTo) : addressesToSendTo;

    if (Array.isArray(addressesToSendTo)) {
      addressesToSendTo = addressesToSendTo.map((email) => {
        return {email, canSend: true};
      });
    } else {
      addressesToSendTo = {email: addressesToSendTo};
    }

    let reporterEmailContent;
    if (user.auth.local) {
      reporterEmailContent = user.auth.local.email;
    } else if (user.auth.facebook && user.auth.facebook.emails && user.auth.facebook.emails[0]) {
      reporterEmailContent = user.auth.facebook.emails[0].value;
    }

    let authorEmailContent;
    if (author.auth.local) {
      authorEmailContent = author.auth.local.email;
    } else if (author.auth.facebook && author.auth.facebook.emails && author.auth.facebook.emails[0]) {
      authorEmailContent = author.auth.facebook.emails[0].value;
    }

    let groupUrl;
    if (group._id === 'habitrpg') {
      groupUrl = '/#/options/groups/tavern';
    } else if (group.type === 'guild') {
      groupUrl = `/#/options/groups/guilds/{$group._id}`;
    } else {
      groupUrl = 'party';
    }

    sendTxn(addressesToSendTo, 'flag-report-to-mods', [
      {name: 'MESSAGE_TIME', content: (new Date(message.timestamp)).toString()},
      {name: 'MESSAGE_TEXT', content: message.text},

      {name: 'REPORTER_USERNAME', content: user.profile.name},
      {name: 'REPORTER_UUID', content: user._id},
      {name: 'REPORTER_EMAIL', content: reporterEmailContent},
      {name: 'REPORTER_MODAL_URL', content: `/static/front/#?memberId={$user._id}`},

      {name: 'AUTHOR_USERNAME', content: message.user},
      {name: 'AUTHOR_UUID', content: message.uuid},
      {name: 'AUTHOR_EMAIL', content: authorEmailContent},
      {name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId={$message.uuid}`},

      {name: 'GROUP_NAME', content: group.name},
      {name: 'GROUP_TYPE', content: group.type},
      {name: 'GROUP_ID', content: group._id},
      {name: 'GROUP_URL', content: groupUrl},
    ]);

    res.respond(200, message);
  },
};

export default api;
