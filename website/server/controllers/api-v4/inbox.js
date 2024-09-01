import { authWithHeaders } from '../../middlewares/auth';
import { apiError } from '../../libs/apiError';
import { NotFound } from '../../libs/errors';
import { listConversations } from '../../libs/inbox/conversation.methods';
import {
  applyLikeToMessages,
  clearPMs, deleteMessage, getUserInbox,
} from '../../libs/inbox';
import { chatReporterFactory } from '../../libs/chatReporting/chatReporterFactory';
import * as inboxLib from '../../libs/inbox';
import logger, { logTime } from '../../libs/logger';

const api = {};

/* NOTE most inbox routes are either in the user or members controller */

/* NOTE the getInboxMessages route is implemented in v3 only */

/* NOTE this route has also an API v3 version */

/**
 * @apiIgnore
 * @api {delete} /api/v4/inbox/messages/:messageId Delete a message
 * @apiName deleteMessage
 * @apiGroup User
 *
 * @apiParam (Path) {UUID} messageId The id of the message to delete
 *
 * @apiSuccess {Object} data Empty object
 * @apiSuccessExample {json}
 * {
 *   "success": true,
 *   "data": {}
 * }
 */
api.deleteMessage = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
  url: '/inbox/messages/:messageId',
  async handler (req, res) {
    req.checkParams('messageId', apiError('messageIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { messageId } = req.params;
    const { user } = res.locals;

    const deleted = await deleteMessage(user, messageId);
    if (!deleted) throw new NotFound(res.t('messageGroupChatNotFound'));

    res.respond(200);
  },
};

/* NOTE this route has also an API v3 version */

/**
 * @apiIgnore
 * @api {delete} /api/v4/inbox/clear Delete all messages
 * @apiName clearMessages
 * @apiGroup User
 *
 * @apiSuccess {Object} data Empty object
 *
 * @apiSuccessExample {json}
 * {"success":true,"data":{},"notifications":[]}
 */
api.clearMessages = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
  url: '/inbox/clear',
  async handler (req, res) {
    const { user } = res.locals;

    await clearPMs(user);

    res.respond(200, {});
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v4/inbox/conversations Get the conversations for a user
 * @apiName conversations
 * @apiGroup Inbox
 * @apiDescription Get the conversations for a user.
 * This is for API v4 which must not be used in third-party tools.
 * For API v3, use "Get inbox messages for a user".
 *
 * @apiParam (Query) {Number} page (optional) Load the conversations of the selected Page
 * - 10 conversations per Page
 *
 * @apiSuccess {Array} data An array of inbox conversations
 *
 * @apiSuccessExample {json} Success-Response:
 * {"success":true,"data":[
 *    {
 *       "_id":"8a9d461b-f5eb-4a16-97d3-c03380c422a3",
 *       "uuid":"8a9d461b-f5eb-4a16-97d3-c03380c422a3",
 *       "user":"user display name",
 *       "username":"some_user_name",
 *       "timestamp":"12315123123",
 *       "text":"last message of conversation",
 *       "userStyles": {},
 *       "contributor": {},
 *       "canReceive": true,
 *       "count":1
 *    }
 * }
 */
api.conversations = {
  method: 'GET',
  middlewares: [authWithHeaders({ userFieldsToInclude: ['profile', 'contributor', 'backer', 'inbox'] })],
  url: '/inbox/conversations',
  async handler (req, res) {
    const { user } = res.locals;
    const { page } = req.query;

    const result = await listConversations(user, page);

    res.respond(200, result);
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v4/inbox/paged-messages Get inbox messages for a user
 * @apiName GetInboxMessages
 * @apiGroup Inbox
 * @apiDescription Get inbox messages for a user.
 * Entries already populated with the correct `sent` - information
 *
 * @apiParam (Query) {Number} page Load the messages of the selected Page - 10 Messages per Page
 * @apiParam (Query) {GUID} conversation Loads only the messages of a conversation
 *
 * @apiSuccess {Array} data An array of inbox messages
 */
api.getInboxMessages = {
  method: 'GET',
  url: '/inbox/paged-messages',
  middlewares: [authWithHeaders({ userFieldsToInclude: ['profile', 'contributor', 'backer', 'inbox'] })],
  async handler (req, res) {
    const { user } = res.locals;
    const { page, conversation } = req.query;

    const userInbox = await getUserInbox(user, {
      page, conversation, mapProps: true,
    });

    res.respond(200, userInbox);
  },
};

/**
 * @apiIgnore
 * @api {post} /api/v4/members/flag-private-message/:messageId Flag a private message
 * @apiDescription Moderators are notified about every flagged message,
 * including the sender, recipient, and full content of the message.
 * This is for API v4 which must not be used in third-party tools as it can change without notice.
 * There is no equivalent route in API v3.
 * @apiName FlagPrivateMessage
 * @apiGroup Member
 *
 * @apiParam (Path) {UUID} messageId The private message id
 *
 * @apiSuccess {Object} data The flagged private message
 * @apiSuccess {UUID} data.id The id of the message
 * @apiSuccess {String} data.text The text of the message
 * @apiSuccess {Number} data.timestamp The timestamp of the message in milliseconds
 * @apiSuccess {Object} data.likes The likes of the message (always an empty object)
 * @apiSuccess {Object} data.flags The flags of the message
 * @apiSuccess {Number} data.flagCount The number of flags the message has
 * @apiSuccess {UUID} data.uuid The User ID of the author of the message,
 *                              or of the recipient if `sent` is true
 * @apiSuccess {String} data.user The Display Name of the author of the message,
 *                                or of the recipient if `sent` is true
 * @apiSuccess {String} data.username The Username of the author of the message,
 *                                    or of the recipient if `sent` is true
 *
 * @apiUse MessageNotFound
 * @apiUse MessageIdRequired
 * @apiError (400) {BadRequest} messageGroupChatFlagAlreadyReported You have already
 *                                                                  reported this message
 */
api.flagPrivateMessage = {
  method: 'POST',
  url: '/members/flag-private-message/:messageId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const chatReporter = chatReporterFactory('Inbox', req, res);
    const message = await chatReporter.flag();
    res.respond(200, {
      ok: true,
      message,
    });
  },
};

/**
 * @api {post} /api/v4//inbox/like-private-message/:uniqueMessageId Like a private message
 * @apiName LikePrivateMessage
 * @apiGroup Inbox
 * @apiDescription Likes a private message, this uses the uniqueMessageId which is a shared ID
 * between message copies of both chat participants
 *
 * @apiParam (Path) {UUID} uniqueMessageId This is NOT private message.id,
 * but rather message.uniqueMessageId
 *
 * @apiSuccess {Object} data The liked <a href='https://github.com/HabitRPG/habitica/blob/develop/website/server/models/message.js#L42' target='_blank'>private message</a>
 *
 * @apiUse MessageNotFound
 */
api.likePrivateMessage = {
  method: 'POST',
  url: '/inbox/like-private-message/:uniqueMessageId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const innerHandler = logTime(req.url, 'LIKE: innerHandler');

    req.checkParams('uniqueMessageId', apiError('messageIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { uniqueMessageId } = req.params;

    const logTime1 = logTime(req.url, 'LIKE: getMessageByUnique');

    const messages = await inboxLib.getInboxMessagesByUniqueId(uniqueMessageId);

    logTime1();

    if (messages.length === 0) {
      throw new NotFound(res.t('messageGroupChatNotFound'));
    }

    if (messages.length > 2) {
      logger.error(`More than 2 Messages exist with this uniqueMessageId: ${uniqueMessageId} check in Database!`);
    }

    const logTime2 = logTime(req.url, 'LIKE: before saving changes');

    await applyLikeToMessages(user, messages);

    logTime2();

    const messageToReturn = messages.find(m => m.uuid === user._id);

    res.respond(200, messageToReturn);

    innerHandler();
  },
};

export default api;
