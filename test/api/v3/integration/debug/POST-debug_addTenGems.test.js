import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /debug/add-ten-gems', () => {
  let userToGainTenGems;

  before(async () => {
    userToGainTenGems = await generateUser();
  });

  after(() => {
    nconf.set('IS_PROD', false);
  });

  it('adds ten gems to the current user', async () => {
    await userToGainTenGems.post('/debug/add-ten-gems');

    let userWithTenGems = await userToGainTenGems.get('/user');

    expect(userWithTenGems.balance).to.equal(2.5);
  });

  it('returns error when not in production mode', async () => {
    nconf.set('IS_PROD', true);

    await expect(userToGainTenGems.post('/debug/add-ten-gems'))
    .eventually.be.rejected.and.to.deep.equal({
      code: 404,
      error: 'NotFound',
      message: 'Not found.',
    });
  });
});
