import { authWithHeaders } from '../../middlewares/auth';
import * as inboxLib from '../../libs/inbox';

let api = {};

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
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const user = res.locals.user;
    const page = req.query.page;
    const conversation = req.query.conversation;

    const userInbox = await inboxLib.getUserInbox(user, {
      page, conversation,
    });

    res.respond(200, userInbox);
  },
};

module.exports = api;
