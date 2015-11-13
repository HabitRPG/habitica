import request from 'request';
import { 
  send as sendEmail,
  sendTxn as sendTxnEmail,
  getUserInfo,
} from '../../../../../website/src/libs/api-v3/email';

function getUser () {
  return {
    _id: 'random _id',
    auth: {
      local: {
        username: 'username',
        email: 'email@email',
      },
      facebook: {
        emails: [{
          value: 'email@facebook'
        }],
        displayName: 'fb display name',
      }
    },
    profile: {
      name: 'profile name',
    },
    preferences: {
      emailNotifications: {
        unsubscribeFromAll: false
      },
    },
  };
};

describe('emails', () => {

  beforeEach(() => {
    sandbox.stub(request, 'post');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('sendEmail', () => {

  });

  describe('getUserInfo', () => {
    it('returns an empty object if no field request', () => {
      expect(getUserInfo({}, [])).to.be.empty;
    });

    it('returns correct user data', () => {
      let user = getUser();
      let data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);

      expect(data).to.have.property('name', user.profile.name);
      expect(data).to.have.property('email', user.auth.local.email);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('returns correct user data [facebook users]', () => {
      let user = getUser();
      delete user.profile['name'];
      delete user.auth['local'];

      let data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);
      
      expect(data).to.have.property('name', user.auth.facebook.displayName);
      expect(data).to.have.property('email', user.auth.facebook.emails[0].value);
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });

    it('has fallbacks for missing data', () => {
      let user = getUser();
      delete user.profile['name'];
      delete user.auth.local['email']
      delete user.auth['facebook'];

      let data = getUserInfo(user, ['name', 'email', '_id', 'canSend']);
      
      expect(data).to.have.property('name', user.auth.local.username);
      expect(data).not.to.have.property('email');
      expect(data).to.have.property('_id', user._id);
      expect(data).to.have.property('canSend', true);
    });
  });

  describe('sendTxnEmail', () => {

  });
});
