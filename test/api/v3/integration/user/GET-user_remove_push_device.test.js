import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /user/remove-push-device', () => {
  let user;
  let regId = '10';
  let type = 'ios';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error if user does not have the push device', async () => {
    await expect(user.get(`/user/remove-push-device/${regId}`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('pushDeviceNotFound'),
      });
  });

// More tests in common code unit tests

  it('removes a push device from the user', async () => {
    await user.post('/user/add-push-device', {type, regId});
    let response = await user.get(`/user/remove-push-device/${regId}`);
    await user.sync();

    expect(response.message).to.equal(t('pushDeviceRemoved'));
    expect(user.pushDevices.length).to.equal(0);
  });
});
