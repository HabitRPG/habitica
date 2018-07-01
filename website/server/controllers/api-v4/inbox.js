import { authWithHeaders } from '../../middlewares/auth';
import { toArray, orderBy } from 'lodash';
import apiError from '../../libs/apiError';
import {
  inboxModel as Inbox,
} from '../../models/message';
import {
  NotFound,
} from '../../libs/errors';

const api = {};

/* NOTE most inbox routes are either in the user or members controller */

/**
 * @api {get} /api/v4/inbox/messages Get inbox messages for a user
 * @apiPrivate
 * @apiName GetInboxMessages
 * @apiGroup Inbox
 * @apiDescription Get inbox messages for a user
 *
 * @apiSuccess {Array} data An array of inbox messages
 */
api.getInboxMessages = {
  method: 'GET',
  url: '/inbox/messages',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const messagesObj = res.locals.user.inbox.messages;
    const messagesArray = orderBy(toArray(messagesObj), ['timestamp'], ['desc']);

    res.respond(200, messagesArray);
  },
};

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
  url: '/user/messages/:messageId',
  async handler (req, res) {
    req.checkParams('messageId', apiError('messageIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const messageId = req.params.messageId;
    const user = res.locals.user;

    const message = await Inbox.findOne({_id: messageId, ownerId: user._id }).exec();
    if (!message) throw new NotFound(res.t('messageGroupChatNotFound'));

    await Inbox.remove({_id: message._id, ownerId: user._id}).exec();

    res.respond(200);
  },
};


module.exports = api;
