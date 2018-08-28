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

module.exports = api;
