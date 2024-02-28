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
    nconf.set('ENABLE_TIME_TRAVEL', false);
  });

  it('returns the shifted time', async () => {
    nconf.set('ENABLE_TIME_TRAVEL', true);
    const result = await user.get('/debug/time-travel-time');
    expect(result.time).to.exist;
    await user.post('/debug/jump-time', { disable: true });
  });

  it('returns error when the user is not an admin', async () => {
    nconf.set('ENABLE_TIME_TRAVEL', true);
    const regularUser = await generateUser();
    await expect(regularUser.get('/debug/time-travel-time'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 400,
        error: 'BadRequest',
        message: 'You do not have permission to time travel.',
      });
  });

  it('returns error when not in time travel mode', async () => {
    nconf.set('ENABLE_TIME_TRAVEL', false);

    await expect(user.get('/debug/time-travel-time'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
