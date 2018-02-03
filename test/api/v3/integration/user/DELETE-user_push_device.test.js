import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('DELETE /user/push-devices', () => {
  let user;
  let regId = '10';
  let type = 'ios';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error if user does not have the push device', async () => {
    await expect(user.del(`/user/push-devices/${regId}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('pushDeviceNotFound'),
      });
  });

  it('removes a push device from the user', async () => {
    await user.post('/user/push-devices', {type, regId});
    let response = await user.del(`/user/push-devices/${regId}`);
    await user.sync();

    expect(response.message).to.equal(t('pushDeviceRemoved'));
    expect(user.pushDevices.length).to.equal(0);
  });
});
