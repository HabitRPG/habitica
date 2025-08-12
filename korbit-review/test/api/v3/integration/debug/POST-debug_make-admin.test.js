import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/make-admin', () => {
  let user;
  let nconfStub;

  before(async () => {
    user = await generateUser();
  });

  beforeEach(() => {
    nconfStub = sandbox.stub(nconf, 'get');
    nconfStub.withArgs('BASE_URL').returns('https://example.com');
  });

  afterEach(() => {
    nconfStub.restore();
  });

  it('makes user an admin', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(true);
    await user.post('/debug/make-admin');

    await user.sync();

    expect(user.permissions.fullAccess).to.eql(true);
  });

  it('returns error when not in production mode', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);

    await expect(user.post('/debug/make-admin'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
