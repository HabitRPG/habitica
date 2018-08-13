import { authWithHeaders } from '../../middlewares/auth';
import * as inboxLib from '../../libs/inbox';

let api = {};

/* NOTE most inbox routes are either in the user or members controller */

/* NOTE this route has also an API v4 version */
/**
 * @api {get} /api/v3/inbox/messages Get inbox messages for a user
 * @apiName GetInboxMessages
 * @apiGroup Inbox
 * @apiDescription Get inbox messages for a user
 *
 * @apiSuccess {Array} data An array of <a href='https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js#L51' target='_blank'>chat messages</a>
 */
api.getInboxMessages = {
  method: 'GET',
  url: '/inbox/messages',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const user = res.locals.user;

    const userInbox = await inboxLib.getUserInbox(user);

    res.respond(200, userInbox);
  },
};

module.exports = api;
