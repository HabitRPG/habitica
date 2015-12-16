import {
  generateUser,
  requester,
} from '../../../../helpers/api-integration.helper';

describe('GET /user', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('returns the authenticated user', () => {
    return api.get('/user')
    .then(returnedUser => {
      expect(returnedUser._id).to.equal(user._id);
    });
  });

  it('does not return private paths (and apiToken)', () => {
    return api.get('/user')
    .then(returnedUser => {
      expect(returnedUser.auth.local.hashed_password).to.be.a('undefined');
      expect(returnedUser.auth.local.salt).to.be.a('undefined');
      expect(returnedUser.apiToken).to.be.a('undefined');
    });
  });
});
