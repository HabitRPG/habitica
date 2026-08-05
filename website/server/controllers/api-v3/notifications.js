import { authWithHeaders } from '../../middlewares/auth';
import {
  NotificationNotFound,
} from '../../libs/errors';
import {
  model as User,
} from '../../models/user';

const api = {};

/**
 * @api {post} /api/v3/notifications/:notificationId/read Mark one notification as read
 * @apiName ReadNotification
 * @apiGroup Notification
 *
 * @apiParam (Path) {UUID} notificationId Required. ID of the notification to mark as read.
 *
 * @apiSuccess {Object} data user.notifications
 */
api.readNotification = {
  method: 'POST',
  url: '/notifications/:notificationId/read',
  middlewares: [authWithHeaders({ leanUser: true, userFieldsToInclude: ['notifications'] })],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('notificationId', res.t('notificationIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const index = user.notifications.findIndex(n => n && n.id === req.params.notificationId);

    if (index === -1) {
      throw new NotificationNotFound(req.language);
    }

    user.notifications.splice(index, 1);

    await user.updateOne({
      $pull: { notifications: { id: req.params.notificationId } },
    }).exec();

    res.respond(200, user.notifications);
  },
};

/**
 * @api {post} /api/v3/notifications/read Mark multiple notifications as read
 * @apiDescription Marks multiple notifications as read by removing them
 * from the user's notification list. This differs from marking notifications
 * as seen, which retains them but sets the `seen` field to true.
 * @apiName ReadNotifications
 * @apiGroup Notification
 *
 * @apiParam {String[]} notificationIds Array of notification IDs to mark as read
 * (required)
 *
 * @apiExample {json} Request-Example:
 * {
 *   "notificationIds": ["abcdef123", "ghi456789"]
 * }
 *
 * @apiSuccess {Object[]} data Updated user.notifications array
 */

api.readNotifications = {
  method: 'POST',
  url: '/notifications/read',
  middlewares: [authWithHeaders({ leanUser: true, userFieldsToInclude: ['notifications'] })],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkBody('notificationIds', res.t('notificationsRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const notificationsIds = req.body.notificationIds;
    for (const notificationId of notificationsIds) {
      const index = user.notifications.findIndex(n => n && n.id === notificationId);

      if (index === -1) {
        throw new NotificationNotFound(req.language);
      }

      user.notifications.splice(index, 1);
    }

    await user.updateOne({
      $pull: { notifications: { id: { $in: notificationsIds } } },
    }).exec();

    res.respond(200, user.notifications);
  },
};

/**
 * @api {post} /api/v3/notifications/:notificationId/see Mark one notification as seen
 * @apiDescription Mark a notification as seen.
 * Different from marking them as read in that the notification isn't
 * removed but the `seen` field is set to `true`.
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
  middlewares: [authWithHeaders({ leanUser: true, userFieldsToInclude: ['notifications'] })],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('notificationId', res.t('notificationIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { notificationId } = req.params;

    const notification = user.notifications.find(n => n && n.id === notificationId);

    if (!notification) {
      throw new NotificationNotFound(req.language);
    }

    notification.seen = true;

    await User.updateOne({
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

/**
 * @api {post} /api/v3/notifications/see Mark multiple notifications as seen
 * @apiName SeeNotifications
 * @apiGroup Notification
 *
 * @apiParam {String[]} notificationIds Required. Array of notification ID strings to mark as seen.
 *
 * @apiExample {json} Request-Example:
 * {
 *   "notificationIds": ["abcdef123", "ghi456789"]
 * }
 *
 * @apiSuccess {Object} data user.notifications
 */

api.seeNotifications = {
  method: 'POST',
  url: '/notifications/see',
  middlewares: [authWithHeaders({ leanUser: true, userFieldsToInclude: ['notifications'] })],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkBody('notificationIds', res.t('notificationsRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const notificationsIds = req.body.notificationIds;

    for (const notificationId of notificationsIds) {
      const notification = user.notifications.find(n => n && n.id === notificationId);

      if (!notification) {
        throw new NotificationNotFound(req.language);
      }

      notification.seen = true;
    }

    await user.save();

    res.respond(200, user.notifications);
  },
};

export default api;
