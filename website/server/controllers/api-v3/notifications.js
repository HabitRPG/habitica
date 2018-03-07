import { authWithHeaders } from '../../middlewares/auth';
import {
  NotFound,
} from '../../libs/errors';
import {
  model as User,
} from '../../models/user';
import {
  model as UserNotification,
} from '../../models/userNotification';

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

    const index = user.notifications.findIndex(n => {
      return n && n.id === req.params.notificationId;
    });

    if (index === -1) {
      throw new NotFound(res.t('messageNotificationNotFound'));
    }

    user.notifications.splice(index, 1);

    // Update the user version field manually,
    // it cannot be updated in the pre update hook
    // See https://github.com/HabitRPG/habitica/pull/9321#issuecomment-354187666 for more info
    user._v++;

    await user.update({
      $pull: { notifications: { id: req.params.notificationId } },
    }).exec();

    res.respond(200, UserNotification.convertNotificationsToSafeJson(user.notifications));
  },
};

/**
 * @api {post} /api/v3/notifications/read Mark multiple notifications as read
 * @apiName ReadNotifications
 * @apiGroup Notification
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

    let notificationsIds = req.body.notificationIds;
    for (let notificationId of notificationsIds) {
      const index = user.notifications.findIndex(n => {
        return n && n.id === notificationId;
      });

      if (index === -1) {
        throw new NotFound(res.t('messageNotificationNotFound'));
      }

      user.notifications.splice(index, 1);
    }

    await user.update({
      $pull: { notifications: { id: { $in: notificationsIds } } },
    }).exec();

    // Update the user version field manually,
    // it cannot be updated in the pre update hook
    // See https://github.com/HabitRPG/habitica/pull/9321#issuecomment-354187666 for more info
    user._v++;

    res.respond(200, UserNotification.convertNotificationsToSafeJson(user.notifications));
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

    const notification = user.notifications.find(n => {
      return n && n.id === notificationId;
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

    // Update the user version field manually,
    // it cannot be updated in the pre update hook
    // See https://github.com/HabitRPG/habitica/pull/9321#issuecomment-354187666 for more info
    user._v++;

    res.respond(200, notification);
  },
};

/**
 * @api {post} /api/v3/notifications/see Mark multiple notifications as seen
 * @apiName SeeNotifications
 * @apiGroup Notification
 *
 * @apiSuccess {Object} data user.notifications
 */
api.seeNotifications = {
  method: 'POST',
  url: '/notifications/see',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody('notificationIds', res.t('notificationsRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let notificationsIds = req.body.notificationIds;

    for (let notificationId of notificationsIds) {
      const notification = user.notifications.find(n => {
        return n && n.id === notificationId;
      });

      if (!notification) {
        throw new NotFound(res.t('messageNotificationNotFound'));
      }

      notification.seen = true;
    }

    await user.save();

    res.respond(200, UserNotification.convertNotificationsToSafeJson(user.notifications));
  },
};

module.exports = api;
