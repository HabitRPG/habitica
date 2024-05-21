import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /debug/time-travel-time', () => {
  let user;
  before(async () => {
    user = await generateUser({ permissions: { fullAccess: true } });
  });

  after(() => {
    nconf.set('TIME_TRAVEL_ENABLED', false);
  });

  it('returns the shifted time', async () => {
    nconf.set('TIME_TRAVEL_ENABLED', true);
    const result = await user.get('/debug/time-travel-time');
    expect(result.time).to.exist;
    await user.post('/debug/jump-time', { disable: true });
  });

  it('returns shifted when the user is not an admin', async () => {
    nconf.set('TIME_TRAVEL_ENABLED', true);
    const regularUser = await generateUser();
    const result = await regularUser.get('/debug/time-travel-time');
    expect(result.time).to.exist;
  });

  it('returns error when not in time travel mode', async () => {
    nconf.set('TIME_TRAVEL_ENABLED', false);

    await expect(user.get('/debug/time-travel-time'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
