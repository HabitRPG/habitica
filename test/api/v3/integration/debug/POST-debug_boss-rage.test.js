import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /debug/boss-rage', () => {
  let user;
  let nconfStub;

  beforeEach(async () => {
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

  it('errors if user is not in a party', async () => {
    await expect(user.post('/debug/boss-rage'))
      .to.eventually.be.rejected.and.to.deep.equal({
        code: 400,
        error: 'BadRequest',
        message: 'User not in a party.',
      });
  });

  it('increases boss rage to 50', async () => {
    await user.updateOne({
      'party.quest.key': 'trex_undead',
    });

    await user.post('/debug/boss-rage');

    await user.sync();

    expect(user.party.quest.progress.rage).to.eql(50);
  });

  it('returns error when not in production mode', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);

    await expect(user.post('/debug/boss-rage'))
      .eventually.be.rejected.and.to.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });
});
