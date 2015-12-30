import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('GET /user', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('returns the authenticated user', () => {
    return user.get('/user')
    .then(returnedUser => {
      expect(returnedUser._id).to.equal(user._id);
    });
  });

  it('does not return private paths (and apiToken)', () => {
    return user.get('/user')
    .then(returnedUser => {
      expect(returnedUser.auth.local.hashed_password).to.not.exist;
      expect(returnedUser.auth.local.salt).to.not.exist;
      expect(returnedUser.apiToken).to.not.exist;
    });
  });
});
