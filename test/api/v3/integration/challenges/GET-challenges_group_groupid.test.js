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

    it('should return group challenges for non member', async () => {
      let challenges = await nonMember.get(`/challenges/groups/${publicGuild._id}`);

      let foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
    });

    it('should return group challenges for member', async () => {
      let challenges = await user.get(`/challenges/groups/${publicGuild._id}`);

      let foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
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

    it('should return group challenges for member', async () => {
      let challenges = await user.get(`/challenges/groups/${privateGuild._id}`);

      let foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
    });
  });
});
