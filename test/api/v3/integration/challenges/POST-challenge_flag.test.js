import {
  generateChallenge,
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /challenges/:challengeId/flag', () => {
  let user, challenge, guild;

  beforeEach(async () => {
    let { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'TestPrivateGuild',
        type: 'guild',
        privacy: 'private',
      },
      members: 1,
    });

    guild = group;
    user = groupLeader;

    challenge = await generateChallenge(user, group);
  });

  it('returns an error when challenge is not found', async () => {
    await expect(user.post(`/challenges/${generateUUID()}/flag`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
  });

  it('flags a challenge', async () => {
    const flagResult = await user.post(`/challenges/${challenge._id}/flag`);

    expect(flagResult.challenge.flags[user._id]).to.equal(true);
    expect(flagResult.challenge.flagCount).to.equal(1);
  });

  it('flags a challenge with a higher count when from an admin', async () => {
    await user.update({'contributor.admin': true});

    const flagResult = await user.post(`/challenges/${challenge._id}/flag`);

    expect(flagResult.challenge.flags[user._id]).to.equal(true);
    expect(flagResult.challenge.flagCount).to.equal(5);
  });

  it('returns an error when user tries to flag a challenge that is already flagged', async () => {
    await user.post(`/challenges/${challenge._id}/flag`);

    await expect(user.post(`/challenges/${challenge._id}/flag`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageChallengeFlagAlreadyReported'),
      });
  });

  it('does not return a flagged challenge in routes', async () => {
    const admin = await generateUser({'contributor.admin': true});
    await admin.post(`/challenges/${challenge._id}/flag`);

    const userChallenges = await user.get('/challenges/user');
    const guildChallenges = await user.get(`/challenges/groups/${guild._id}`);

    const userChallengeFound = userChallenges.find(chal => chal._id === challenge._id);
    expect(userChallengeFound).to.not.exist;

    await expect(user.get(`/challenges/${challenge._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });

    const guildChallengeFound = guildChallenges.find(chal => chal._id === challenge._id);
    expect(guildChallengeFound).to.not.exist;
  });

  it('does return a flagged challenge in routes if user is admin', async () => {
    let { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'TestPrivateGuild',
        type: 'guild',
        privacy: 'private',
      },
      members: 1,
    });

    const admin = groupLeader;
    guild = group;
    await admin.update({'contributor.admin': true});
    challenge = await generateChallenge(admin, guild);
    await admin.post(`/challenges/${challenge._id}/flag`);

    const userChallenges = await admin.get('/challenges/user');
    const challengeFound = admin.get(`/challenges/${challenge._id}`);
    const guildChallenges = await admin.get(`/challenges/groups/${guild._id}`);

    const userChallengeFound = userChallenges.find(chal => chal._id === challenge._id);
    expect(userChallengeFound).to.exist;

    expect(challengeFound).to.exist;

    const guildChallengeFound = guildChallenges.find(chal => chal._id === challenge._id);
    expect(guildChallengeFound).to.exist;
  });
});
