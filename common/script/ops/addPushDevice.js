import _ from 'lodash';
import i18n from '../i18n';
import splitWhitespace from '../libs/splitWhitespace';
import {
  BadRequest,
  NotAuthorized,
} from '../libs/errors';

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

  let response = {
    data: _.pick(user, splitWhitespace('pushDevices')),
    message: i18n.t('pushDeviceAdded', req.language),
  };

  return response;
};
