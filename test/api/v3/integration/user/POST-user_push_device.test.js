import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/push-devices', () => {
  let user;
  const regId = '10';
  const type = 'ios';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error when regId is not provided', async () => {
    await expect(user.post('/user/push-devices'), { type })
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns an error when type is not provided', async () => {
    await expect(user.post('/user/push-devices', { regId }))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns an error when type is not valid', async () => {
    await expect(user.post('/user/push-devices', { regId, type: 'invalid' }))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('fails silently if user already has the push device', async () => {
    await user.post('/user/push-devices', { type, regId });
    const response = await user.post('/user/push-devices', { type, regId });
    await user.sync();

    expect(response.message).to.equal(t('pushDeviceAdded'));
    expect(response.data[0].type).to.equal(type);
    expect(response.data[0].regId).to.equal(regId);
    expect(user.pushDevices[0].type).to.equal(type);
    expect(user.pushDevices[0].regId).to.equal(regId);
  });

  it('adds a push device to the user', async () => {
    const response = await user.post('/user/push-devices', { type, regId });
    await user.sync();

    expect(response.message).to.equal(t('pushDeviceAdded'));
    expect(response.data[0].type).to.equal(type);
    expect(response.data[0].regId).to.equal(regId);
    expect(user.pushDevices[0].type).to.equal(type);
    expect(user.pushDevices[0].regId).to.equal(regId);
  });
});
