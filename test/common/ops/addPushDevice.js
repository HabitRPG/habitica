import addPushDevice from '../../../common/script/ops/addPushDevice';
import i18n from '../../../common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
  BadRequest,
} from '../../../common/script/libs/errors';

describe('shared.ops.addPushDevice', () => {
  let user;
  let regId = '10';
  let type = 'someRandomType';

  beforeEach(() => {
    user = generateUser();
    user.stats.hp = 0;
  });

  it('returns an error when regId is not provided', (done) => {
    try {
      addPushDevice(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('regIdRequired'));
      done();
    }
  });

  it('returns an error when type is not provided', (done) => {
    try {
      addPushDevice(user, {body: {regId}});
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('typeRequired'));
      done();
    }
  });

  it('adds a push device', () => {
    let response = addPushDevice(user, {body: {regId, type}});

    expect(response.message).to.equal(i18n.t('pushDeviceAdded'));
    expect(user.pushDevices[0].type).to.equal(type);
    expect(user.pushDevices[0].regId).to.equal(regId);
  });

  it('does not a push device twice', (done) => {
    try {
      addPushDevice(user, {body: {regId, type}});
      addPushDevice(user, {body: {regId, type}});
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('pushDeviceAlreadyAdded'));
      done();
    }
  });
});
