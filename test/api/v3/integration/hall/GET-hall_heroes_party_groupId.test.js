import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import apiError from '../../../../../website/server/libs/apiError';

describe('GET /heroes/party/:groupId', () => {
  let user; // admin user

  before(async () => {
    user = await generateUser({
      'permissions.userSupport': true,
    });
  });

  it('requires the caller to be an admin', async () => {
    const nonAdmin = await generateUser();
    const party = await generateGroup(nonAdmin, { type: 'party', privacy: 'private' });
    await expect(nonAdmin.get(`/hall/heroes/party/${party._id}`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: apiError('noPrivAccess'),
    });
  });

  it('validates req.params.groupId', async () => {
    await expect(user.get('/hall/heroes/party/invalidUUID')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('handles non-existing party', async () => {
    const dummyId = generateUUID();
    await expect(user.get(`/hall/heroes/party/${dummyId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: apiError('groupWithIDNotFound', { groupId: dummyId }),
    });
  });

  it('returns only necessary party data given group id', async () => {
    const nonAdmin = await generateUser();
    const party = await generateGroup(nonAdmin, { type: 'party', privacy: 'private' });

    const partyRes = await user.get(`/hall/heroes/party/${party._id}`);

    expect(partyRes).to.have.all.keys([ // works as: object has all and only these keys
      '_id', 'id', 'balance', 'challengeCount', 'leader', 'leaderOnly', 'memberCount',
      'purchased', 'quest', 'summary',
    ]);
    expect(partyRes.summary).to.eq(' ');
    // NB: 'summary' is NOT a field that the API route retrieves!
    // It must not be retrieved for privacy reasons.
    // However the group model automatically adds a summary for reasons given here:
    // https://github.com/HabitRPG/habitica/blob/8da36bf27c62ba0397a6af260c20d35a17f3d911/website/server/models/group.js#L161-L170
  });
});
