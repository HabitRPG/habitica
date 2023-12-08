import { v4 as generateUUID } from 'uuid';
import {
  generateChallenge,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /challenges/:challengeId/clearflags', () => {
  let admin;
  let nonAdmin;
  let challenge;

  beforeEach(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'TestParty',
        type: 'party',
        privacy: 'private',
      },
      members: 1,
    });

    admin = groupLeader;
    [nonAdmin] = members;

    await admin.updateOne({ 'permissions.moderator': true });

    challenge = await generateChallenge(admin, group);
    await admin.post(`/challenges/${challenge._id}/flag`);
  });

  it('returns error when non-admin attempts to clear flags', async () => {
    await expect(nonAdmin.post(`/challenges/${generateUUID()}/clearflags`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupChatAdminClearFlagCount'),
      });
  });

  it('returns an error when challenge is not found', async () => {
    await expect(admin.post(`/challenges/${generateUUID()}/clearflags`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
  });

  it('clears flags and sets mod flag to false', async () => {
    await nonAdmin.post(`/challenges/${challenge._id}/flag`);
    const flagResult = await admin.post(`/challenges/${challenge._id}/clearflags`);

    expect(flagResult.challenge.flagCount).to.eql(0);
    expect(flagResult.challenge.flags).to.have.property(admin._id, false);
    expect(flagResult.challenge.flags).to.have.property(nonAdmin._id, true);
  });
});
