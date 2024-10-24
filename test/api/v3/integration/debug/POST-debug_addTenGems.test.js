import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/add-ten-gems', () => {
  let userToGainTenGems;
  let nconfStub;

  before(async () => {
    userToGainTenGems = await generateUser();
  });

  beforeEach(() => {
    nconfStub = sandbox.stub(nconf, 'get');
    nconfStub.withArgs('BASE_URL').returns('https://example.com');
  });

  afterEach(() => {
    nconfStub.restore();
  });

  it('adds ten gems to the current user', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(true);
    await userToGainTenGems.post('/debug/add-ten-gems');

    const userWithTenGems = await userToGainTenGems.get('/user');

    expect(userWithTenGems.balance).to.equal(2.5);
  });

  it('returns error when not in production mode', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);

    await expect(userToGainTenGems.post('/debug/add-ten-gems'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
