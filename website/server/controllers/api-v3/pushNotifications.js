import { authWithHeaders } from '../../middlewares/auth';
import {
  NotFound,
} from '../../libs/errors';
import { model as PushDevice } from '../../models/pushDevice';

const api = {};

/**
 * @apiIgnore
 * @api {post} /api/v3/user/push-devices Add a push device to a user
 * @apiName UserAddPushDevice
 * @apiGroup User
 *
 * @apiParam (Body) {String} regId The id of the push device
 * @apiParam (Body) {String} type The type of push device
 *
 * @apiSuccess {Object} data List of push devices
 * @apiSuccess {String} message Success message
 */
api.addPushDevice = {
  method: 'POST',
  url: '/user/push-devices',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkBody('regId', res.t('regIdRequired')).notEmpty();
    req.checkBody('type', res.t('typeRequired')).notEmpty().isIn(['ios', 'android']);

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { pushDevices } = user;

    const item = {
      regId: req.body.regId,
      type: req.body.type,
    };

    // When adding a duplicate push device, fail silently instead of throwing an error
    if (pushDevices.find(device => device.regId === item.regId)) {
      res.respond(200, user.pushDevices, res.t('pushDeviceAdded'));
      return;
    }

    // Concurrency safe update
    const pushDevice = (new PushDevice(item)).toJSON(); // Create a mongo doc
    await user.update({
      $push: { pushDevices: pushDevice },
    }).exec();

    // Update the response
    user.pushDevices.push(pushDevice);

    res.respond(200, user.pushDevices, res.t('pushDeviceAdded'));
  },
};

/**
 * @apiIgnore
 * @api {delete} /api/v3/user/push-devices/:regId remove a push device from a user
 * @apiName UserRemovePushDevice
 * @apiGroup User
 *
 * @apiParam (Path) {String} regId The id of the push device
 *
 * @apiSuccess {Object} data List of push devices
 * @apiSuccess {String} message Success message
 */
api.removePushDevice = {
  method: 'DELETE',
  url: '/user/push-devices/:regId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    req.checkParams('regId', res.t('regIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { regId } = req.params;

    const { pushDevices } = user;

    const indexOfPushDevice = pushDevices.findIndex(element => element.regId === regId);

    if (indexOfPushDevice === -1) {
      throw new NotFound(res.t('pushDeviceNotFound'));
    }

    // Concurrency safe update
    const pullQuery = { $pull: { pushDevices: { regId } } };
    await user.update(pullQuery).exec();

    // Update the response
    pushDevices.splice(indexOfPushDevice, 1);

    res.respond(200, user.pushDevices, res.t('pushDeviceRemoved'));
  },
};

export default api;
