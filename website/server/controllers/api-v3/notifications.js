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
 * @apiParam (Path) {UUID} notificationId
 *
 * @apiSuccess {Object} data user.notifications
 */
api.readNotification = {
  method: 'POST',
  url: '/notifications/:notificationId/read',
  middlewares: [authWithHeaders()],
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

    // Update the user version field manually,
    // it cannot be updated in the pre update hook
    // See https://github.com/HabitRPG/habitica/pull/9321#issuecomment-354187666 for more info
    user._v += 1;

    await user.update({
      $pull: { notifications: { id: req.params.notificationId } },
    }).exec();

    res.respond(200, user.notifications);
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

    await user.update({
      $pull: { notifications: { id: { $in: notificationsIds } } },
    }).exec();

    // Update the user version field manually,
    // it cannot be updated in the pre update hook
    // See https://github.com/HabitRPG/habitica/pull/9321#issuecomment-354187666 for more info
    user._v += 1;

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
  middlewares: [authWithHeaders()],
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
    user._v += 1;

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
