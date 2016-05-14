import _ from 'lodash';
import i18n from '../i18n';
import {
  BadRequest,
  NotAuthorized,
} from '../libs/errors';

// TODO move to server code
module.exports = function addPushDevice (user, req = {}) {
  let regId = _.get(req, 'body.regId');
  if (!regId) throw new BadRequest(i18n.t('regIdRequired', req.language));

  let type = _.get(req, 'body.type');
  if (!type) throw new BadRequest(i18n.t('typeRequired', req.language));

  if (!user.pushDevices) {
    user.pushDevices = [];
  }

  let pushDevices = user.pushDevices;

  let item = {
    regId,
    type,
  };

  let indexOfPushDevice = _.findIndex(pushDevices, {
    regId: item.regId,
  });

  if (indexOfPushDevice !== -1) {
    throw new NotAuthorized(i18n.t('pushDeviceAlreadyAdded', req.language));
  }

  pushDevices.push(item);

  return [
    user.pushDevices,
    i18n.t('pushDeviceAdded', req.language),
  ];
};
