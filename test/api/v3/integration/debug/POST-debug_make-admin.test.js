import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/give-user-support', () => {
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

  it('gives user support permission', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(true);
    await user.post('/debug/give-user-support');

    await user.sync();

    expect(user.permissions.userSupport).to.eql(true);
  });

  it('returns error when not in production mode', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);

    await expect(user.post('/debug/give-user-support'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
