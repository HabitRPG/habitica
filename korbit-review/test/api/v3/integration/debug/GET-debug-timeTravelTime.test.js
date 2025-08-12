import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /debug/time-travel-time', () => {
  let user;
  let nconfStub;

  before(async () => {
    user = await generateUser({ permissions: { fullAccess: true } });
  });

  beforeEach(() => {
    nconfStub = sandbox.stub(nconf, 'get');
  });

  afterEach(() => {
    nconfStub.restore();
  });

  it('returns the shifted time', async () => {
    nconfStub.withArgs('TIME_TRAVEL_ENABLED').returns(true);
    const result = await user.get('/debug/time-travel-time');
    expect(result.time).to.exist;
    await user.post('/debug/jump-time', { disable: true });
  });

  it('returns shifted when the user is not an admin', async () => {
    nconfStub.withArgs('TIME_TRAVEL_ENABLED').returns(true);
    const regularUser = await generateUser();
    const result = await regularUser.get('/debug/time-travel-time');
    expect(result.time).to.exist;
  });

  it('returns error when not in time travel mode', async () => {
    nconfStub.withArgs('TIME_TRAVEL_ENABLED').returns(false);

    await expect(user.get('/debug/time-travel-time'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
