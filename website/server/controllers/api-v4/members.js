import { authWithHeaders } from '../../middlewares/auth';
import { chatReporterFactory } from '../../libs/chatReporting/chatReporterFactory';

let api = {};

/**
 * @api {post} /api/v4/members/flag-private-message/:messageId Flag a private message
 * @apiDescription An email and slack message are sent to the moderators about every flagged message.
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
 * @apiSuccess {UUID} data.uuid The User ID of the author of the message, or of the recipient if `sent` is true
 * @apiSuccess {String} data.user The Display Name of the author of the message, or of the recipient if `sent` is true
 * @apiSuccess {String} data.username The Username of the author of the message, or of the recipient if `sent` is true
 *
 * @apiUse MessageNotFound
 * @apiUse MessageIdRequired
 * @apiError (400) {BadRequest} messageGroupChatFlagAlreadyReported You have already reported this message
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
