import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/push-devices', () => {
  let user;
  let regId = '10';
  let type = 'ios';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error when regId is not provided', async () => {
    await expect(user.post('/user/push-devices'), {type})
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns an error when type is not provided', async () => {
    await expect(user.post('/user/push-devices', {regId}))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns an error when type is not valid', async () => {
    await expect(user.post('/user/push-devices', {regId, type: 'invalid'}))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns an error if user already has the push device', async () => {
    await user.post('/user/push-devices', {type, regId});
    await expect(user.post('/user/push-devices', {type, regId}))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('pushDeviceAlreadyAdded'),
      });
  });

  it('adds a push device to the user', async () => {
    const response = await user.post('/user/push-devices', {type, regId});
    await user.sync();

    expect(response.message).to.equal(t('pushDeviceAdded'));
    expect(response.data[0].type).to.equal(type);
    expect(response.data[0].regId).to.equal(regId);
    expect(user.pushDevices[0].type).to.equal(type);
    expect(user.pushDevices[0].regId).to.equal(regId);
  });

  it('removes a push device to the user', async () => {
    await user.post('/user/push-devices', {type, regId});

    const response = await user.del(`/user/push-devices/${regId}`);
    await user.sync();

    expect(response.message).to.equal(t('pushDeviceRemoved'));
    expect(response.data[0]).to.not.exist;
    expect(user.pushDevices[0]).to.not.exist;
  });
});
