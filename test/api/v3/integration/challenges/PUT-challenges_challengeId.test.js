import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { MAX_SUMMARY_SIZE_FOR_CHALLENGES } from '../../../../../website/common/script/constants';

describe('PUT /challenges/:challengeId', () => {
  let privateGuild; let user; let nonMember; let challenge; let
    member;

  beforeEach(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'TestPrivateGuild',
        type: 'guild',
        privacy: 'private',
      },
      members: 1,
      upgradeToGroupPlan: true,
    });

    privateGuild = group;
    user = groupLeader;

    nonMember = await generateUser();
    member = members[0]; // eslint-disable-line prefer-destructuring

    challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);
    await member.post(`/challenges/${challenge._id}/join`);
  });

  it('fails if the user can\'t view the challenge', async () => {
    await expect(nonMember.put(`/challenges/${challenge._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('challengeNotFound'),
      });
  });

  it('should only allow the leader or an admin to update the challenge', async () => {
    await expect(member.put(`/challenges/${challenge._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyLeaderUpdateChal'),
      });
  });

  it('only updates allowed fields', async () => {
    const res = await user.put(`/challenges/${challenge._id}`, {
      // ignored
      prize: 33,
      group: 'blabla',
      memberCount: 33,
      tasksOrder: 'new order',
      official: true,
      shortName: 'new short name',
      leader: member._id,

      // applied
      name: 'New Challenge Name',
      description: 'New challenge description.',
    });

    expect(res.prize).to.equal(0);
    expect(res.group).to.eql({
      _id: privateGuild._id,
      privacy: privateGuild.privacy,
      name: privateGuild.name,
      type: privateGuild.type,
    });
    expect(res.memberCount).to.equal(2);
    expect(res.tasksOrder).not.to.equal('new order');
    expect(res.official).to.equal(false);

    expect(res.leader).to.eql({
      _id: user._id,
      id: user._id,
      profile: { name: user.profile.name },
      auth: {
        local: {
          username: user.auth.local.username,
        },
      },
      flags: {
        verifiedUsername: true,
      },
    });
    expect(res.name).to.equal('New Challenge Name');
    expect(res.description).to.equal('New challenge description.');
  });

  it('return error when challenge summary is greater than MAX_SUMMARY_SIZE_FOR_CHALLENGES characters', async () => {
    const summary = 'A'.repeat(MAX_SUMMARY_SIZE_FOR_CHALLENGES + 1);
    await expect(user.put(`/challenges/${challenge._id}`, {
      summary,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });
});
