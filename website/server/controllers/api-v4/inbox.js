import { authWithHeaders } from '../../middlewares/auth';
import apiError from '../../libs/apiError';
import {
  NotFound,
} from '../../libs/errors';
import { listConversations } from '../../libs/inbox/conversation.methods';
import {
  clearPMs, deleteMessage, getUserInbox, searchUserInbox,
} from '../../libs/inbox';

const api = {};

/* NOTE most inbox routes are either in the user or members controller */

/* NOTE the getInboxMessages route is implemented in v3 only */

/* NOTE this route has also an API v3 version */

/**
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
 * @api {get} /api/v4/inbox/conversations Get the conversations for a user
 * @apiName conversations
 * @apiGroup Inbox
 * @apiDescription Get the conversations for a user.
 * This is for API v4 which must not be used in third-party tools.
 * For API v3, use "Get inbox messages for a user".
 *
 * @apiParam (Query) {String} searchMessage Lists only the conversations that contain this message
 *
 * @apiSuccess {Array} data An array of inbox conversations
 *
 * @apiSuccessExample {json} Success-Response:
 * {"success":true,"data":[
 *    {
 *       "_id":"8a9d461b-f5eb-4a16-97d3-c03380c422a3",
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
  middlewares: [authWithHeaders()],
  url: '/inbox/conversations',
  async handler (req, res) {
    const { user } = res.locals;
    const { searchMessage } = req.query;

    const result = await listConversations(user, searchMessage);

    res.respond(200, result);
  },
};

/**
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
  middlewares: [authWithHeaders()],
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
 * @api {get} /api/v4/inbox/search-messages Search inbox messages for a user
 * @apiName SearchInboxMessages
 * @apiGroup Inbox
 * @apiDescription Search inbox messages for a user.
 * Entries already populated with the correct `sent` - information
 *
 * @apiParam (Query) {Timestamp} Optional beforeTimestamp
 * Load the messages before (less then equal) this timestamp
 * @apiParam (Query) {Timestamp} Optional afterTimestamp
 * Load the messages after (greater then equal) this timestamp
 * @apiParam (Query) {String} Optional searchMessage
 * Load the messages that contain this searchMessage-string
 * @apiParam (Query) {GUID} conversation Loads only the messages of a conversation
 *
 * @apiSuccess {Array} data An array of inbox messages
 */
api.searchInboxMessages = {
  method: 'GET',
  url: '/inbox/search-messages',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const {
      beforeTimestamp, afterTimestamp, conversation, searchMessage,
    } = req.query;

    const userInbox = await searchUserInbox(user, {
      beforeTimestamp,
      afterTimestamp,
      searchMessage,
      conversation,
      mapProps: true,
    });

    res.respond(200, userInbox);
  },
};

export default api;
