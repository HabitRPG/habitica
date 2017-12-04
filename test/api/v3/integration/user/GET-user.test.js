import {
  generateUser,
} from '../../../../helpers/api-integration/v3';
import common from '../../../../../website/common';

describe('GET /user', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns the authenticated user with computed stats', async () => {
    let returnedUser = await user.get('/user');
    expect(returnedUser._id).to.equal(user._id);

    expect(returnedUser.stats.maxMP).to.exist;
    expect(returnedUser.stats.maxHealth).to.equal(common.maxHealth);
    expect(returnedUser.stats.toNextLevel).to.equal(common.tnl(returnedUser.stats.lvl));
  });

  it('does not return private paths (and apiToken)', async () => {
    let returnedUser = await user.get('/user');

    expect(returnedUser.auth.local.hashed_password).to.not.exist;
    expect(returnedUser.auth.local.passwordHashMethod).to.not.exist;
    expect(returnedUser.auth.local.salt).to.not.exist;
    expect(returnedUser.apiToken).to.not.exist;
  });

  it('returns only user properties requested', async () => {
    let returnedUser = await user.get('/user?userFields=achievements,items.mounts');

    expect(returnedUser._id).to.equal(user._id);
    expect(returnedUser.achievements).to.exist;
    expect(returnedUser.items.mounts).to.exist;
    expect(returnedUser.stats).to.not.exist;
  });
});
