import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('GET challenges/group/:groupId', () => {
  context('Public Guild', () => {
    let publicGuild, user, nonMember, challenge, challenge2;

    before(async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestGuild',
          type: 'guild',
          privacy: 'public',
        },
      });

      publicGuild = group;
      user = groupLeader;

      nonMember = await generateUser();

      challenge = await generateChallenge(user, group);
      challenge2 = await generateChallenge(user, group);
    });

    it('should return group challenges for non member with populated leader', async () => {
      let challenges = await nonMember.get(`/challenges/groups/${publicGuild._id}`);

      let foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      expect(foundChallenge1.leader).to.eql({
        _id: publicGuild.leader._id,
        id: publicGuild.leader._id,
        profile: {name: user.profile.name},
      });
      let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
        _id: publicGuild.leader._id,
        id: publicGuild.leader._id,
        profile: {name: user.profile.name},
      });
    });

    it('should return group challenges for member with populated leader', async () => {
      let challenges = await user.get(`/challenges/groups/${publicGuild._id}`);

      let foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      expect(foundChallenge1.leader).to.eql({
        _id: publicGuild.leader._id,
        id: publicGuild.leader._id,
        profile: {name: user.profile.name},
      });
      let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
        _id: publicGuild.leader._id,
        id: publicGuild.leader._id,
        profile: {name: user.profile.name},
      });
    });

    it('should return newest challenges first', async () => {
      let challenges = await user.get(`/challenges/groups/${publicGuild._id}`);

      let foundChallengeIndex = _.findIndex(challenges, { _id: challenge2._id });
      expect(foundChallengeIndex).to.eql(0);

      let newChallenge = await generateChallenge(user, publicGuild);

      challenges = await user.get(`/challenges/groups/${publicGuild._id}`);

      foundChallengeIndex = _.findIndex(challenges, { _id: newChallenge._id });
      expect(foundChallengeIndex).to.eql(0);
    });
  });

  context('Private Guild', () => {
    let privateGuild, user, nonMember, challenge, challenge2;

    before(async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestPrivateGuild',
          type: 'guild',
          privacy: 'private',
        },
      });

      privateGuild = group;
      user = groupLeader;

      nonMember = await generateUser();

      challenge = await generateChallenge(user, group);
      challenge2 = await generateChallenge(user, group);
    });

    it('should prevent non-member from seeing challenges', async () => {
      await expect(nonMember.get(`/challenges/groups/${privateGuild._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });

    it('should return group challenges for member with populated leader', async () => {
      let challenges = await user.get(`/challenges/groups/${privateGuild._id}`);

      let foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      expect(foundChallenge1.leader).to.eql({
        _id: privateGuild.leader._id,
        id: privateGuild.leader._id,
        profile: {name: user.profile.name},
      });
      let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
        _id: privateGuild.leader._id,
        id: privateGuild.leader._id,
        profile: {name: user.profile.name},
      });
    });
  });

  context('official challenge is present', () => {
    let publicGuild, user, officialChallenge, challenge, challenge2;

    before(async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestGuild',
          type: 'guild',
          privacy: 'public',
        },
      });

      user = groupLeader;
      publicGuild = group;

      await user.update({
        'contributor.admin': true,
      });

      officialChallenge = await generateChallenge(user, group, {
        official: true,
      });

      challenge = await generateChallenge(user, group);
      challenge2 = await generateChallenge(user, group);
    });

    it('should return official challenges first', async () => {
      let challenges = await user.get(`/challenges/groups/${publicGuild._id}`);

      let foundChallengeIndex = _.findIndex(challenges, { _id: officialChallenge._id });
      expect(foundChallengeIndex).to.eql(0);
    });

    it('should return newest challenges first, after official ones', async () => {
      let challenges = await user.get(`/challenges/groups/${publicGuild._id}`);

      let foundChallengeIndex = _.findIndex(challenges, { _id: challenge._id });
      expect(foundChallengeIndex).to.eql(2);

      foundChallengeIndex = _.findIndex(challenges, { _id: challenge2._id });
      expect(foundChallengeIndex).to.eql(1);

      let newChallenge = await generateChallenge(user, publicGuild);

      challenges = await user.get(`/challenges/groups/${publicGuild._id}`);

      foundChallengeIndex = _.findIndex(challenges, { _id: newChallenge._id });
      expect(foundChallengeIndex).to.eql(1);
    });
  });
});
