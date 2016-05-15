import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
} from '../../../../helpers/api-v3-integration.helper';

describe('GET challenges/user', () => {
  let user, member, nonMember, challenge, challenge2, publicGuild;

  before(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'TestGuild',
        type: 'guild',
        privacy: 'public',
      },
      members: 1,
    });

    user = groupLeader;
    publicGuild = group;
    member = members[0];
    nonMember = await generateUser();

    challenge = await generateChallenge(user, group);
    challenge2 = await generateChallenge(user, group);
  });

  it('should return challenges user has joined', async () => {
    await nonMember.post(`/challenges/${challenge._id}/join`);

    let challenges = await nonMember.get('/challenges/user');

    let foundChallenge = _.find(challenges, { _id: challenge._id });
    expect(foundChallenge).to.exist;
    expect(foundChallenge.leader).to.eql({
      _id: publicGuild.leader._id,
      id: publicGuild.leader._id,
      profile: {name: user.profile.name},
    });
    expect(foundChallenge.group).to.eql({
      _id: publicGuild._id,
      type: publicGuild.type,
      privacy: publicGuild.privacy,
      name: publicGuild.name,
    });
  });

  it('should return challenges user has created', async () => {
    let challenges = await user.get('/challenges/user');

    let foundChallenge1 = _.find(challenges, { _id: challenge._id });
    expect(foundChallenge1).to.exist;
    expect(foundChallenge1.leader).to.eql({
      _id: publicGuild.leader._id,
      id: publicGuild.leader._id,
      profile: {name: user.profile.name},
    });
    expect(foundChallenge1.group).to.eql({
      _id: publicGuild._id,
      type: publicGuild.type,
      privacy: publicGuild.privacy,
      name: publicGuild.name,
    });
    let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
    expect(foundChallenge2).to.exist;
    expect(foundChallenge2.leader).to.eql({
      _id: publicGuild.leader._id,
      id: publicGuild.leader._id,
      profile: {name: user.profile.name},
    });
    expect(foundChallenge2.group).to.eql({
      _id: publicGuild._id,
      type: publicGuild.type,
      privacy: publicGuild.privacy,
      name: publicGuild.name,
    });
  });

  it('should return challenges in user\'s group', async () => {
    let challenges = await member.get('/challenges/user');

    let foundChallenge1 = _.find(challenges, { _id: challenge._id });
    expect(foundChallenge1).to.exist;
    expect(foundChallenge1.leader).to.eql({
      _id: publicGuild.leader._id,
      id: publicGuild.leader._id,
      profile: {name: user.profile.name},
    });
    expect(foundChallenge1.group).to.eql({
      _id: publicGuild._id,
      type: publicGuild.type,
      privacy: publicGuild.privacy,
      name: publicGuild.name,
    });
    let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
    expect(foundChallenge2).to.exist;
    expect(foundChallenge2.leader).to.eql({
      _id: publicGuild.leader._id,
      id: publicGuild.leader._id,
      profile: {name: user.profile.name},
    });
    expect(foundChallenge2.group).to.eql({
      _id: publicGuild._id,
      type: publicGuild.type,
      privacy: publicGuild.privacy,
      name: publicGuild.name,
    });
  });

  it('should not return challenges user doesn\'t have access to', async () => {
    let { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'TestPrivateGuild',
        type: 'guild',
        privacy: 'private',
      },
    });

    let privateChallenge = await generateChallenge(groupLeader, group);

    let challenges = await nonMember.get('/challenges/user');

    let foundChallenge = _.find(challenges, { _id: privateChallenge._id });
    expect(foundChallenge).to.not.exist;
  });
});
