import { authWithHeaders } from '../../middlewares/auth';
import _ from 'lodash';
import {
  NotFound,
} from '../../libs/errors';
import {
  model as User,
} from '../../models/user';

let api = {};

/**
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

/**
 * @api {post} /api/v3/notifications/:notificationId/see Mark one notification as seen
 * @apiDescription Mark a notification as seen. Different from marking them as read in that the notification isn't removed but the `seen` field is set to `true`
 * @apiName SeeNotification
 * @apiGroup Notification
 *
 * @apiParam (Path) {UUID} notificationId
 *
 * @apiSuccess {Object} data The modified notification
 */
api.seeNotification = {
  method: 'POST',
  url: '/notifications/:notificationId/see',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('notificationId', res.t('notificationIdRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const notificationId = req.params.notificationId;

    let notification = _.find(user.notifications, {
      id: notificationId,
    });

    if (!notification) {
      throw new NotFound(res.t('messageNotificationNotFound'));
    }

    notification.seen = true;

    await User.update({
      _id: user._id,
      'notifications.id': notificationId,
    }, {
      $set: {
        'notifications.$.seen': true,
      },
    }).exec();

    res.respond(200, notification);
  },
};


module.exports = api;
