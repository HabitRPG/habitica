import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { TAVERN_ID } from '../../../../../website/common/script/constants';

describe('GET challenges/groups/:groupId', () => {
  context('Group Plan', () => {
    let privateGuild; let user; let nonMember; let challenge; let
      challenge2;

    before(async () => {
      const { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestPrivateGuild',
          type: 'guild',
          privacy: 'private',
        },
        upgradeToGroupPlan: true,
      });

      privateGuild = group;
      user = groupLeader;

      nonMember = await generateUser();

      challenge = await generateChallenge(user, group);
      await user.post(`/challenges/${challenge._id}/join`);
      challenge2 = await generateChallenge(user, group);
      await user.post(`/challenges/${challenge2._id}/join`);
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
      const challenges = await user.get(`/challenges/groups/${privateGuild._id}`);

      const foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      expect(foundChallenge1.leader).to.eql({
        _id: privateGuild.leader._id,
        id: privateGuild.leader._id,
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
      const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
        _id: privateGuild.leader._id,
        id: privateGuild.leader._id,
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
    });
  });

  context('Party', () => {
    let party; let user; let nonMember; let challenge; let
      challenge2;

    before(async () => {
      const { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestParty',
          type: 'party',
        },
      });

      party = group;
      user = groupLeader;

      nonMember = await generateUser();

      challenge = await generateChallenge(user, group);
      await user.post(`/challenges/${challenge._id}/join`);
      challenge2 = await generateChallenge(user, group);
      await user.post(`/challenges/${challenge2._id}/join`);
    });

    it('should prevent non-member from seeing challenges', async () => {
      await expect(nonMember.get(`/challenges/groups/${party._id}`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('groupNotFound'),
        });
    });

    it('should return group challenges for member with populated leader', async () => {
      const challenges = await user.get(`/challenges/groups/${party._id}`);

      const foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      expect(foundChallenge1.leader).to.eql({
        _id: party.leader._id,
        id: party.leader._id,
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
      const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
        _id: party.leader._id,
        id: party.leader._id,
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
    });

    it('should return group challenges for member using ID "party"', async () => {
      const challenges = await user.get('/challenges/groups/party');

      const foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      expect(foundChallenge1.leader).to.eql({
        _id: party.leader._id,
        id: party.leader._id,
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
      const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
        _id: party.leader._id,
        id: party.leader._id,
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
    });
  });

  context('Tavern', () => {
    let tavern; let user; let challenge; let
      challenge2;

    before(async () => {
      user = await generateUser();
      await user.update({ balance: 0.5 });
      tavern = await user.get(`/groups/${TAVERN_ID}`);

      challenge = await generateChallenge(user, tavern, { prize: 1 });
      await user.post(`/challenges/${challenge._id}/join`);
      challenge2 = await generateChallenge(user, tavern, { prize: 1 });
      await user.post(`/challenges/${challenge2._id}/join`);
    });

    it('should return tavern challenges with populated leader', async () => {
      const challenges = await user.get(`/challenges/groups/${TAVERN_ID}`);

      const foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      expect(foundChallenge1.leader).to.eql({
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
      const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
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
    });

    it('should return tavern challenges using ID "habitrpg"', async () => {
      const challenges = await user.get('/challenges/groups/habitrpg');

      const foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.exist;
      expect(foundChallenge1.leader).to.eql({
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
      const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
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
    });

    context('official challenge is present', () => {
      let officialChallenge; let unofficialChallenges;

      before(async () => {
        await user.update({
          'permissions.challengeAdmin': true,
          balance: 3,
        });

        officialChallenge = await generateChallenge(user, tavern, {
          categories: [{
            name: 'habitica_official',
            slug: 'habitica_official',
          }],
          prize: 1,
        });
        await user.post(`/challenges/${officialChallenge._id}/join`);

        // We add 10 extra challenges to test whether the official challenge
        // (the oldest) makes it to the front page.
        unofficialChallenges = [];
        for (let i = 0; i < 10; i += 1) {
          const challenge = await generateChallenge(user, tavern, { prize: 1 }); // eslint-disable-line
          await user.post(`/challenges/${challenge._id}/join`); // eslint-disable-line
          unofficialChallenges.push(challenge);
        }
      });

      it('should return official challenges first', async () => {
        const challenges = await user.get('/challenges/groups/habitrpg');

        const foundChallengeIndex = _.findIndex(challenges, { _id: officialChallenge._id });
        expect(foundChallengeIndex).to.eql(0);
      });

      it('should return newest challenges first, after official ones', async () => {
        let challenges = await user.get('/challenges/groups/habitrpg');

        unofficialChallenges.forEach((chal, index) => {
          const foundChallengeIndex = _.findIndex(challenges, { _id: chal._id });
          expect(foundChallengeIndex).to.eql(10 - index);
        });

        const newChallenge = await generateChallenge(user, tavern, { prize: 1 });
        await user.post(`/challenges/${newChallenge._id}/join`);

        challenges = await user.get('/challenges/groups/habitrpg');

        const foundChallengeIndex = _.findIndex(challenges, { _id: newChallenge._id });
        expect(foundChallengeIndex).to.eql(1);
      });
    });
  });
});
