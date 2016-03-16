import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /development/addTenGems', () => {
  let userToGainTenGems;

  before(async () => {
    userToGainTenGems = await generateUser();
  });

  it('adds ten gems to the current user', async () => {
    await userToGainTenGems.post('/development/addTenGems');

    let userWithTenGems = await userToGainTenGems.get('/user');

    expect(userWithTenGems.balance).to.equal(2.5);
  });

  it('returns error when not in production mode', async () => {
    nconf.set('IS_PROD', true);

    await expect(userToGainTenGems.post('/development/addTenGems'))
    .eventually.be.rejected.and.to.deep.equal({
      code: 404,
      error: 'NotFound',
      message: 'Not found.',
    });
  });

  after(() => {
    nconf.set('IS_PROD', false);
  });
});
