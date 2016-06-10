import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/add-push-device', () => {
  let user;
  let regId = '10';
  let type = 'ios';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error when regId is not provided', async () => {
    await expect(user.post('/user/add-push-device'))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        message: t('regIdRequired'),
      });
  });

  it('returns an error when type is not provided', async () => {
    await expect(user.post('/user/add-push-device', {regId }))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        message: t('typeRequired'),
      });
  });

  it('returns an error if user already has the push device', async () => {
    await user.post('/user/add-push-device', {type, regId});
    await expect(user.post('/user/add-push-device', {type, regId}))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('pushDeviceAlreadyAdded'),
      });
  });

  // More tests in common code unit tests

  it('adds a push device to the user', async () => {
    let response = await user.post('/user/add-push-device', {type, regId});
    await user.sync();

    expect(response.message).to.equal(t('pushDeviceAdded'));
    expect(user.pushDevices[0].type).to.equal(type);
    expect(user.pushDevices[0].regId).to.equal(regId);
  });
});
