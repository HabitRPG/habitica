import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /user', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns the authenticated user', async () => {
    let returnedUser = await user.get('/user');
    expect(returnedUser._id).to.equal(user._id);
  });

  it('does not return private paths (and apiToken)', async () => {
    let returnedUser = await user.get('/user');

    expect(returnedUser.auth.local.hashed_password).to.not.exist;
    expect(returnedUser.auth.local.salt).to.not.exist;
    expect(returnedUser.apiToken).to.not.exist;
  });
});
