import { authWithHeaders } from '../../middlewares/api-v3/auth';
import common from '../../../../common';

let api = {};

/**
 * @apiIgnore Not yet part of the public API
 * @api {post} /api/v3/notifications Create a new notification
 * @apiVersion 3.0.0
 * @apiName CreateTag
 * @apiGroup Tag
 *
 * @apiSuccess {Object} data The newly created notification
 */
api.createNotification = {
  method: 'POST',
  url: '/notifications',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let addNotificationRes = common.ops.addNotification(user, req);
    await user.save();

    res.respond(200, ...addNotificationRes);
  },
};

/**
 * @apiIgnore Not yet part of the public API
 * @api {post} /api/v3/notifications/:notificationId/read Read a notification
 * @apiVersion 3.0.0
 * @apiName ReadNotification
 * @apiGroup Notification
 *
 * @apiSuccess {Object} data user.notifications
 */
api.readNotification = {
  method: 'POST',
  url: '/notifications/:notificationId/read',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let readNotificationRes = common.ops.readNotification(user, req);
    await user.save();

    res.respond(200, ...readNotificationRes);
  },
};

module.exports = api;
