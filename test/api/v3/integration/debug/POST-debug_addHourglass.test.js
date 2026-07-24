import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/add-hourglass', () => {
  let userToGetHourGlass;
  let nconfStub;

  before(async () => {
    userToGetHourGlass = await generateUser();
  });

  beforeEach(() => {
    nconfStub = sandbox.stub(nconf, 'get');
    nconfStub.withArgs('BASE_URL').returns('https://example.com');
  });

  afterEach(() => {
    nconfStub.restore();
  });

  it('adds Hourglass to the current user', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(true);
    await userToGetHourGlass.post('/debug/add-hourglass');

    const userWithHourGlass = await userToGetHourGlass.get('/user');

    expect(userWithHourGlass.purchased.plan.consecutive.trinkets).to.equal(1);
  });

  it('returns error when not in production mode', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);

    await expect(userToGetHourGlass.post('/debug/add-hourglass'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
