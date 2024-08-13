import nconf from 'nconf';
import {
  generateUser,
  createAndPopulateGroup,
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
      .to.eventually.be.rejected.and.deep.equal({
        code: 400,
        error: 'BadRequest',
        message: 'User not in a party.',
      });
  });

  it('returns error when not in production mode', async () => {
    nconfStub.withArgs('DEBUG_ENABLED').returns(false);

    await expect(user.post('/debug/boss-rage'))
      .to.eventually.be.rejected.and.deep.equal({
        code: 404,
        error: 'NotFound',
        message: 'Not found.',
      });
  });

  context('user is in a party', async () => {
    let party;

    beforeEach(async () => {
      const { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
        },
        members: 2,
      });
      party = group;
      user = groupLeader;
    });

    it('increases boss rage to 50', async () => {
      await user.post('/debug/boss-rage');
      await party.sync();
      expect(party.quest.progress.rage).to.eql(50);
    });

    it('increases boss rage to 100', async () => {
      await user.post('/debug/boss-rage');
      await user.post('/debug/boss-rage');
      await party.sync();
      expect(party.quest.progress.rage).to.eql(100);
    });
  });
});
