import { authWithHeaders } from '../../middlewares/auth';
import { chatReporterFactory } from '../../libs/chatReporting/chatReporterFactory';

let api = {};

/**
 * @api {post} /api/v4/members/flag-private-message/:messageId Flag a private message
 * @apiDescription A message will be hidden immediately if a moderator flags the message. An email is sent to the moderators about every flagged message.
 * @apiName FlagPrivateMessage
 * @apiGroup Member
 *
 * @apiParam (Path) {UUID} messageId The private message id
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
 * @apiUse MessageNotFound
 * @apiUse MessageIdRequired
 * @apiError (404) {NotFound} messageGroupChatFlagAlreadyReported The message has already been flagged
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

module.exports = api;
