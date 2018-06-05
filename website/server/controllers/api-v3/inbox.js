import { authWithHeaders } from '../../middlewares/auth';

let api = {};

/* NOTE most inbox routes are either in the user or members controller */

/**
 * @api {get} /api/v3/inbox/messages Get inbox messages for a user
 * @apiName GetInboxMessages
 * @apiGroup Inbox
 * @apiDescription Get inbox messages for a user
 *
 * @apiSuccess {Array} data An array of chat messages
 */
api.getInboxMessages = {
  method: 'GET',
  url: '/inbox/messages',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const messagesObj = res.locals.user.inbox.messages;
    const messagesArray = [];

    Object.keys(messagesObj).forEach(k => messagesArray.push(messagesObj[k]));
    res.respond(200, messagesArray);
  },
};

module.exports = api;