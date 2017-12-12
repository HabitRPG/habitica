import { authWithHeaders } from '../../middlewares/auth';
import _ from 'lodash';
import {
  NotFound,
} from '../../libs/errors';

let api = {};

/**
 * @apiIgnore Not yet part of the public API
 * @api {post} /api/v3/notifications/:notificationId/read Mark one notification as read
 * @apiName ReadNotification
 * @apiGroup Notification
 *
 * @apiParam (Path) {UUID} notificationId
 *
 * @apiSuccess {Object} data user.notifications
 */
api.readNotification = {
  method: 'POST',
  url: '/notifications/:notificationId/read',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('notificationId', res.t('notificationIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let index = _.findIndex(user.notifications, {
      id: req.params.notificationId,
    });

    if (index === -1) {
      throw new NotFound(res.t('messageNotificationNotFound'));
    }

    user.notifications.splice(index, 1);

    await user.update({
      $pull: { notifications: { id: req.params.notificationId } },
    }).exec();

    res.respond(200, user.notifications);
  },
};

/**
 * @apiIgnore Not yet part of the public API
 * @api {post} /api/v3/notifications Mark notifications as read
 * @apiName ReadNotifications
 * @apiGroup Notification
 *
 *
 * @apiSuccess {Object} data user.notifications
 */
api.readNotifications = {
  method: 'POST',
  url: '/notifications/read',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody('notificationIds', res.t('notificationsRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let notifications = req.body.notificationIds;
    for (let notification of notifications) {
      let index = _.findIndex(user.notifications, {
        id: notification,
      });

      if (index === -1) {
        throw new NotFound(res.t('messageNotificationNotFound'));
      }

      user.notifications.splice(index, 1);
    }

    await user.update({
      $pull: { notifications: { id: { $in: notifications } } },
    }).exec();

    res.respond(200, user.notifications);
  },
};

module.exports = api;
