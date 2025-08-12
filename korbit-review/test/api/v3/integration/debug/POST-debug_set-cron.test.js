import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/set-cron', () => {
  let user;
  let nconfStub;

  before(async () => {
    user = await generateUser();
  });

  beforeEach(() => {
    nconfStub = sandbox.stub(nconf, 'get');
    nconfStub.withArgs('DEBUG_ENABLED').returns(true);
    nconfStub.withArgs('BASE_URL').returns('https://example.com');
  });

  afterEach(() => {
    nconfStub.restore();
  });

  it('sets last cron', async () => {
    const newCron = new Date(2015, 11, 20);

    await user.post('/debug/set-cron', {
      lastCron: newCron,
    });

    await user.sync();

    expect(user.lastCron).to.eql(newCron);
  });

  it('returns error when not in production mode', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);

    await expect(user.post('/debug/set-cron'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
