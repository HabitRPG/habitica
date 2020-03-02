import { v4 as generateUUID } from 'uuid';
import {
  generateChallenge,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /challenges/:challengeId/clearflags', () => {
  let user;
  let nonAdmin;
  let challenge;

  beforeEach(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'TestPrivateGuild',
        type: 'guild',
        privacy: 'private',
      },
      members: 1,
    });

    user = groupLeader;
    [nonAdmin] = members;

    await user.update({ 'contributor.admin': true });

    challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/flag`);
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
    await expect(user.post(`/challenges/${generateUUID()}/clearflags`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
  });

  it('clears flags and leaves old flags on the flag object', async () => {
    const flagResult = await user.post(`/challenges/${challenge._id}/clearflags`);

    expect(flagResult.challenge.flagCount).to.eql(0);
    expect(flagResult.challenge.flags).to.have.property(user._id, true);
  });
});
