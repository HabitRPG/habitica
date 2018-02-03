import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('PUT /challenges/:challengeId', () => {
  let privateGuild, user, nonMember, challenge, member;

  beforeEach(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'TestPrivateGuild',
        type: 'guild',
        privacy: 'private',
      },
      members: 1,
    });

    privateGuild = group;
    user = groupLeader;

    nonMember = await generateUser();
    member = members[0];

    challenge = await generateChallenge(user, group);
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
    let res = await user.put(`/challenges/${challenge._id}`, {
      // ignored
      prize: 33,
      group: 'blabla',
      memberCount: 33,
      tasksOrder: 'new order',
      official: true,
      shortName: 'new short name',

      // applied
      name: 'New Challenge Name',
      description: 'New challenge description.',
      leader: member._id,
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
    expect(res.shortName).not.to.equal('new short name');

    expect(res.leader).to.eql({
      _id: member._id,
      id: member._id,
      profile: {name: member.profile.name},
    });
    expect(res.name).to.equal('New Challenge Name');
    expect(res.description).to.equal('New challenge description.');
  });
});
