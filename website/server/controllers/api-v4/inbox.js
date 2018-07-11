import { authWithHeaders } from '../../middlewares/auth';
import { toArray, orderBy } from 'lodash';

let api = {};

/* NOTE most inbox routes are either in the user or members controller */

/**
 * @api {get} /api/v3/inbox/messages Get inbox messages for a user
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

module.exports = api;
