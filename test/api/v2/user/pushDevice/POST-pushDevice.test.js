import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('POST /user/pushDevice', () => {
  let user;

  beforeEach(() => {
    return generateUser().then((_user) => {
      user = _user;
    });
  });

  it('registers a device id', () => {
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
