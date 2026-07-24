import { authWithHeaders } from '../../middlewares/auth';
import * as inboxLib from '../../libs/inbox';
import { sanitizeText as sanitizeMessageText } from '../../models/message';
import highlightMentions from '../../libs/highlightMentions';
import { model as User } from '../../models/user';
import { NotAuthorized, NotFound } from '../../libs/errors';
import { sentMessage } from '../../libs/inbox';

const api = {};

/* NOTE most inbox routes are either in the user or members controller */

/**
 * @api {get} /api/v3/inbox/messages Get inbox messages for a user
 * @apiName GetInboxMessages
 * @apiGroup Inbox
 * @apiDescription Get inbox messages for a user
 *
 * @apiParam (Query) {Number} page Load the messages of the selected Page - 10 Messages per Page
 * @apiParam (Query) {GUID} conversation Loads only the messages of a conversation
 *
 * @apiSuccess {Array} data An array of inbox messages
 */
api.getInboxMessages = {
  method: 'GET',
  url: '/inbox/messages',
  middlewares: [authWithHeaders({ userFieldsToInclude: ['profile', 'contributor', 'backer', 'inbox'] })],
  async handler (req, res) {
    const { user } = res.locals;
    const { page } = req.query;
    const { conversation } = req.query;

    const userInbox = await inboxLib.getUserInbox(user, {
      page, conversation,
    });

    res.respond(200, userInbox);
  },
};

/**
 * @api {post} /api/v3/members/send-private-message Send a private message to a member
 * @apiName SendPrivateMessage
 * @apiGroup Member
 *
 * @apiParam (Body) {String} message The message
 * @apiParam (Body) {UUID} toUserId The id of the user to contact
 *
 * @apiSuccess {Object} data.message The message just sent
 *
 * @apiUse UserNotFound
 */
api.sendPrivateMessage = {
  method: 'POST',
  url: '/members/send-private-message',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkBody('message', res.t('messageRequired')).notEmpty();
    req.checkBody('toUserId', res.t('toUserIDRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const sender = res.locals.user;
    const sanitizedMessageText = sanitizeMessageText(req.body.message);
    const message = (await highlightMentions(sanitizedMessageText))[0];

    const receiver = await User.findById(req.body.toUserId).exec();
    if (!receiver) throw new NotFound(res.t('userNotFound'));
    if (!receiver.flags.verifiedUsername) delete receiver.auth.local.username;

    const objections = sender.getObjectionsToInteraction('send-private-message', receiver);
    if (objections.length > 0 && !sender.hasPermission('moderator')) throw new NotAuthorized(res.t(objections[0]));

    const messageSent = await sentMessage(sender, receiver, message, res.t);

    res.respond(200, { message: messageSent });
  },
};

export default api;
