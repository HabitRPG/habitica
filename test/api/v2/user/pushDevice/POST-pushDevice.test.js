import {
  generateUser,
  requester,
} from '../../../../helpers/api-integration.helper';

describe('POST /user/pushDevice', () => {
  let api;

  beforeEach(() => {
    return generateUser().then((user) => {
      api = requester(user);
    });
  });

  it('registers a device id', () => {
    return api.post('/user/pushDevice', {
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
