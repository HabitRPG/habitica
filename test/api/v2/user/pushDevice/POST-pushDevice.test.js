import {
  generateUser,
} from '../../../../helpers/api-integration/v2';

xdescribe('POST /user/pushDevice', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('registers a device id', async () => {
    return user.post('/user/pushDevice', {
      regId: '123123',
      type: 'android',
    }).then((devices) => {
      let device = devices[0];

      expect(device._id).to.exist;
      expect(device.regId).to.eql('123123');
      expect(device.type).to.eql('android');
    });
  });
});
