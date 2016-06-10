import { authWithHeaders } from '../../middlewares/api-v3/auth';
import _ from 'lodash';
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
  url: '/user/add-push-device',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let regId = _.get(req, 'body.regId');
    if (!regId) throw new BadRequest(res.t('regIdRequired'));

    let type = _.get(req, 'body.type');
    if (!type) throw new BadRequest(res.t('typeRequired'));

    let pushDevices = user.pushDevices;

    let item = {
      regId,
      type,
    };

    let indexOfPushDevice = _.findIndex(pushDevices, {
      regId: item.regId,
    });

    if (indexOfPushDevice !== -1) {
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
  method: 'GET',
  url: '/user/remove-push-device/:regId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    req.checkParams('regId', res.t('regIdRequired')).notEmpty();
    let regId = req.params.regId;

    let pushDevices = user.pushDevices;

    let indexOfPushDevice = _.findIndex(pushDevices, {
      regId,
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
