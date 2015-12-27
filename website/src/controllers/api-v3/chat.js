import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import { model as Group } from '../../models/group';
import {
  NotFound,
} from '../../libs/api-v3/errors';
import _ from 'lodash';

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
  handler (req, res, next) {
    let user = res.locals.user;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    Group.getGroup(user, req.params.groupId, 'chat')
    .then(group => {
      if (!group) throw new NotFound(res.t('groupNotFound'));

      res.respond(200, group.chat);
    })
    .catch(next);
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
  handler (req, res, next) {
    let user = res.locals.user;
    let groupId = req.params.groupId;
    let chatUpdated;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkBody('message', res.t('messageGroupChatBlankMessage')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    Group.getGroup(user, groupId)
    .then((group) => {
      if (!group) throw new NotFound(res.t('groupNotFound'));
      if (group.type !== 'party' && user.flags.chatRevoked) {
        throw new NotFound('Your chat privileges have been revoked.');
      }

      let lastClientMsg = req.query.previousMsg;
      chatUpdated = lastClientMsg && group.chat && group.chat[0] && group.chat[0].id !== lastClientMsg ? true : false;

      group.sendChat(req.body.message, user);

      if (group.type === 'party') {
        user.party.lastMessageSeen = group.chat[0].id;
        user.save();
      }
      return group.save();
    })
    .then((group) => {
      if (chatUpdated) {
        res.respond(200, {chat: group.chat});
      } else {
        res.respond(200, {message: group.chat[0]});
      }
    })
    .catch(next);
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
  handler (req, res, next) {
    let user = res.locals.user;
    let groupId = req.params.groupId;
    let message;

    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty();
    req.checkParams('chatId', res.t('chatIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) return next(validationErrors);

    Group.getGroup(user, groupId)
    .then((group) => {
      if (!group) throw new NotFound(res.t('groupNotFound'));
      message = _.find(group.chat, {id: req.params.chatId});
      if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));

      if (message.uuid === user._id) throw new NotFound(res.t('messageGroupChatLikeOwnMessage'));

      if (!message.likes) message.likes = {};
      if (message.likes[user._id]) {
        delete message.likes[user._id];
      } else {
        message.likes[user._id] = true;
      }

      return group.save();
    })
    .then((group) => {
      if (!group) throw new NotFound(res.t('groupNotFound'));
      res.respond(200, message);
    })
    .catch(next);
  },
};

export default api;
