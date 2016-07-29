import {
  generateUser,
} from '../../../../helpers/api-integration/v3';
import nconf from 'nconf';
import requireAgain from 'require-again';

describe('GET /user', () => {
  let user;
  let pathToUserModelHooks = '../../../../../website/server/models/user/hooks';

  before(async () => {
    user = await generateUser({
      'items.gear.owned.shield_special_1': true,
      'items.pets.Tiger-Veteran': 5,
    });
  });

  it('returns the authenticated user', async () => {
    let returnedUser = await user.get('/user');
    expect(returnedUser._id).to.equal(user._id);
    expect(returnedUser.items.gear.owned.shield_special_1).to.equal(true);
    expect(returnedUser.items.pets['Tiger-Veteran']).to.equal(5);
  });

  it('does not return private paths (and apiToken)', async () => {
    let returnedUser = await user.get('/user');

    expect(returnedUser.auth.local.hashed_password).to.not.exist;
    expect(returnedUser.auth.local.salt).to.not.exist;
    expect(returnedUser.apiToken).to.not.exist;
  });

  it('does not return paths hidden via env variable', async () => {
    sandbox.stub(nconf, 'get').withArgs('USER_PRIVATE_FIELDS').returns('items.gear.owned.shield_special_1,items.pets.Tiger-Veteran');
    requireAgain(pathToUserModelHooks);

    let returnedUser = await user.get('/user');

    expect(returnedUser.items.gear.owned.shield_special_1).to.not.exist;
    expect(returnedUser.items.pets['Tiger-Veteran']).to.not.exist;
  });
});
