import { authWithHeaders } from '../../middlewares/api-v3/auth';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/api-v3/errors';

let api = {};

/**
 * @apiIgnore
 * @api {post} /api/v3/user/add-push-device Add a push device to a user
 * @apiVersion 3.0.0
 * @apiName UserAddPushDevice
 * @apiGroup User
 *
 * @apiParam {string} regId The id of the push device
 * @apiParam {string} type The type of push device
 *
 * @apiSuccess {Object} data List of push devices
 * @apiSuccess {string} message Success message
 */
api.addPushDevice = {
  method: 'POST',
  url: '/user/push-devices',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkBody('regId', res.t('regIdRequired')).notEmpty();
    req.checkBody('type', res.t('typeRequired')).notEmpty();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let pushDevices = user.pushDevices;

    let item = {
      regId: req.body.regId,
      type: req.body.type,
    };

    if (pushDevices.find(device => device.regId === item.regId)) {
      throw new NotAuthorized(res.t('pushDeviceAlreadyAdded'));
    }

    pushDevices.push(item);

    await user.save();

    res.respond(200, {pushDevices: user.pushDevices}, res.t('pushDeviceAdded'));
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v3/user/remove-push-device remove a push device from a user
 * @apiVersion 3.0.0
 * @apiName UserRemovePushDevice
 * @apiGroup User
 *
 * @apiParam {string} regId The id of the push device
 *
 * @apiSuccess {Object} data List of push devices
 * @apiSuccess {string} message Success message
 */
api.removePushDevice = {
  method: 'DELETE',
  url: '/user/push-devices/:regId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('regId', res.t('regIdRequired')).notEmpty();
    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;
    let regId = req.params.regId;

    let pushDevices = user.pushDevices;

    let indexOfPushDevice = pushDevices.findIndex((element) => {
      return element.regId === regId;
    });

    if (indexOfPushDevice === -1) {
      throw new BadRequest(res.t('pushDeviceNotFound'));
    }

    pushDevices.splice(indexOfPushDevice, 1);
    await user.save();

    res.respond(200, {pushDevices: user.pushDevices}, res.t('pushDeviceRemoved'));
  },
};

module.exports = api;
