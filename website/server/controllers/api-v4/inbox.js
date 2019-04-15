import { authWithHeaders } from '../../middlewares/auth';
import apiError from '../../libs/apiError';
import * as inboxLib from '../../libs/inbox';
import {
  NotFound,
} from '../../libs/errors';

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

    const messageId = req.params.messageId;
    const user = res.locals.user;

    const deleted = await inboxLib.deleteMessage(user, messageId);
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
    const user = res.locals.user;

    await inboxLib.clearPMs(user);

    res.respond(200, {});
  },
};

/**
 * @api {get} /inbox/conversations Get the conversations for a user
 * @apiName conversations
 * @apiGroup Inbox
 * @apiDescription Get the conversations for a user
 *
 * @apiSuccess {Array} data An array of inbox conversations
 */
api.conversations = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/inbox/conversations',
  async handler (req, res) {
    const user = res.locals.user;

    const result = await inboxLib.listConversations(user);

    res.respond(200, result);
  },
};

module.exports = api;
