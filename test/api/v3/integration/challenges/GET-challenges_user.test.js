import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  resetHabiticaDB,
} from '../../../../helpers/api-integration/v3';
import { TAVERN_ID } from '../../../../../website/common/script/constants';

describe('GET challenges/user', () => {
  context('no official challenges', () => {
    let user; let member; let nonMember; let challenge; let challenge2; let publicChallenge;
    let groupPlan; let userData; let groupData; let tavern; let tavernData;

    before(async () => {
      await resetHabiticaDB();

      const { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestGuild',
          type: 'guild',
          privacy: 'private',
        },
        members: 1,
        upgradeToGroupPlan: true,
      });

      groupPlan = group;
      groupData = {
        _id: groupPlan._id,
        categories: [],
        id: groupPlan._id,
        type: groupPlan.type,
        privacy: groupPlan.privacy,
        name: groupPlan.name,
        summary: groupPlan.name,
        leader: groupPlan.leader._id,
      };

      user = groupLeader;
      userData = {
        _id: groupPlan.leader._id,
        id: groupPlan.leader._id,
        profile: { name: user.profile.name },
        auth: {
          local: {
            username: user.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      };

      tavern = await user.get(`/groups/${TAVERN_ID}`);
      tavernData = {
        _id: TAVERN_ID,
        categories: [],
        id: TAVERN_ID,
        type: tavern.type,
        privacy: tavern.privacy,
        name: tavern.name,
        summary: tavern.name,
        leader: tavern.leader._id,
      };

      member = members[0]; // eslint-disable-line prefer-destructuring
      nonMember = await generateUser();

      challenge = await generateChallenge(user, group);
      challenge2 = await generateChallenge(user, group);
      await user.update({ balance: 0.25 });
      publicChallenge = await generateChallenge(user, tavern, { prize: 1 });

      await member.post(`/challenges/${challenge._id}/join`);
    });
    context('all challenges', () => {
      it('should return challenges user has joined', async () => {
        const challenges = await member.get('/challenges/user?page=0');

        const foundChallenge = _.find(challenges, { _id: challenge._id });
        expect(foundChallenge).to.exist;
        expect(foundChallenge.leader).to.eql(userData);
        expect(foundChallenge.group).to.eql(groupData);
      });

      it('should return public challenges', async () => {
        const challenges = await nonMember.get('/challenges/user?page=0');

        const foundPublicChallenge = _.find(challenges, { _id: publicChallenge._id });
        expect(foundPublicChallenge).to.exist;
        expect(foundPublicChallenge.leader).to.eql(userData);
        expect(foundPublicChallenge.group).to.eql(tavernData);
      });

      it('should return challenges user has created', async () => {
        const challenges = await user.get('/challenges/user?page=0');

        const foundChallenge1 = _.find(challenges, { _id: challenge._id });
        expect(foundChallenge1).to.exist;
        expect(foundChallenge1.leader).to.eql(userData);
        expect(foundChallenge1.group).to.eql(groupData);
        const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
        expect(foundChallenge2).to.exist;
        expect(foundChallenge2.leader).to.eql(userData);
        expect(foundChallenge2.group).to.eql(groupData);
      });

      it('should return challenges in user\'s group', async () => {
        const challenges = await member.get('/challenges/user?page=0');

        const foundChallenge1 = _.find(challenges, { _id: challenge._id });
        expect(foundChallenge1).to.exist;
        expect(foundChallenge1.leader).to.eql(userData);
        expect(foundChallenge1.group).to.eql(groupData);
        const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
        expect(foundChallenge2).to.exist;
        expect(foundChallenge2.leader).to.eql(userData);
        expect(foundChallenge2.group).to.eql(groupData);
      });

      it('should return newest challenges first', async () => {
        let challenges = await user.get('/challenges/user?page=0');

        let foundChallengeIndex = _.findIndex(challenges, { _id: publicChallenge._id });
        expect(foundChallengeIndex).to.eql(0);

        const newChallenge = await generateChallenge(user, groupPlan);
        await user.post(`/challenges/${newChallenge._id}/join`);

        challenges = await user.get('/challenges/user?page=0');

        foundChallengeIndex = _.findIndex(challenges, { _id: newChallenge._id });
        expect(foundChallengeIndex).to.eql(0);
      });

      it('should not return challenges user doesn\'t have access to', async () => {
        const challenges = await nonMember.get('/challenges/user?page=0');

        const foundChallenge = _.find(challenges, { _id: challenge._id });
        expect(foundChallenge).to.not.exist;
      });

      it('should not return challenges user doesn\'t have access to, even with query parameters', async () => {
        const challenges = await nonMember.get('/challenges/user?page=0&categories=academics&owned=not_owned');

        const foundChallenge = _.find(challenges, { _id: challenge._id });
        expect(foundChallenge).to.not.exist;
      });
    });

    context('my challenges', () => {
      it('should return challenges user has joined', async () => {
        const challenges = await member.get(`/challenges/user?page=0&member=${true}`);

        const foundChallenge = _.find(challenges, { _id: challenge._id });
        expect(foundChallenge).to.exist;
        expect(foundChallenge.leader).to.eql(userData);
        expect(foundChallenge.group).to.eql(groupData);
      });

      it('should return challenges user has created', async () => {
        const challenges = await user.get(`/challenges/user?page=0&member=${true}`);

        const foundChallenge1 = _.find(challenges, { _id: challenge._id });
        expect(foundChallenge1).to.exist;
        expect(foundChallenge1.leader).to.eql(userData);
        expect(foundChallenge1.group).to.eql(groupData);
        const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
        expect(foundChallenge2).to.exist;
        expect(foundChallenge2.leader).to.eql(userData);
        expect(foundChallenge2.group).to.eql(groupData);
        const foundPublicChallenge = _.find(challenges, { _id: publicChallenge._id });
        expect(foundPublicChallenge).to.exist;
        expect(foundPublicChallenge.leader).to.eql(userData);
        expect(foundPublicChallenge.group).to.eql(tavernData);
      });

      it('should return challenges user has created if filter by owned', async () => {
        const challenges = await user.get(`/challenges/user?member=${true}&owned=owned&page=0`);

        const foundChallenge1 = _.find(challenges, { _id: challenge._id });
        expect(foundChallenge1).to.exist;
        expect(foundChallenge1.leader).to.eql(userData);
        expect(foundChallenge1.group).to.eql(groupData);
        const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
        expect(foundChallenge2).to.exist;
        expect(foundChallenge2.leader).to.eql(userData);
        expect(foundChallenge2.group).to.eql(groupData);
        const foundPublicChallenge = _.find(challenges, { _id: publicChallenge._id });
        expect(foundPublicChallenge).to.exist;
        expect(foundPublicChallenge.leader).to.eql(userData);
        expect(foundPublicChallenge.group).to.eql(tavernData);
      });

      it('should not return challenges user has created if filter by not owned', async () => {
        const challenges = await user.get(`/challenges/user?page=0&owned=not_owned&member=${true}`);

        const foundChallenge1 = _.find(challenges, { _id: challenge._id });
        expect(foundChallenge1).to.not.exist;
        const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
        expect(foundChallenge2).to.not.exist;
        const foundPublicChallenge = _.find(challenges, { _id: publicChallenge._id });
        expect(foundPublicChallenge).to.not.exist;
      });

      it('should not return challenges in user groups', async () => {
        const challenges = await member.get(`/challenges/user?page=0&member=${true}`);

        const foundChallenge2 = _.find(challenges, { _id: challenge2._id });
        expect(foundChallenge2).to.not.exist;
      });

      it('should not return public challenges', async () => {
        const challenges = await member.get(`/challenges/user?page=0&member=${true}`);

        const foundPublicChallenge = _.find(challenges, { _id: publicChallenge._id });
        expect(foundPublicChallenge).to.not.exist;
      });
    });
  });

  context('official challenge is present', () => {
    let user; let officialChallenge; let unofficialChallenges; let
      group;

    before(async () => {
      ({ group, groupLeader: user } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestGuild',
          summary: 'summary for TestGuild',
          type: 'guild',
          privacy: 'private',
        },
        upgradeToGroupPlan: true,
      }));

      await user.update({
        'permissions.challengeAdmin': true,
      });

      officialChallenge = await generateChallenge(user, group, {
        categories: [{
          name: 'habitica_official',
          slug: 'habitica_official',
        }],
      });
      await user.post(`/challenges/${officialChallenge._id}/join`);

      // We add 10 extra challenges to test whether the official challenge
      // (the oldest) makes it to the front page.
      unofficialChallenges = [];
      for (let i = 0; i < 10; i += 1) {
        const challenge = await generateChallenge(user, group); // eslint-disable-line
        await user.post(`/challenges/${challenge._id}/join`); // eslint-disable-line
        unofficialChallenges.push(challenge);
      }
    });

    it('should return official challenges first', async () => {
      const challenges = await user.get('/challenges/user?page=0');

      const foundChallengeIndex = _.findIndex(challenges, { _id: officialChallenge._id });
      expect(foundChallengeIndex).to.eql(0);
    });

    it('should return newest challenges first, after official ones', async () => {
      let challenges = await user.get('/challenges/user?page=0');

      unofficialChallenges.forEach((chal, index) => {
        const foundChallengeIndex = _.findIndex(challenges, { _id: chal._id });
        if (index === 0) {
          expect(foundChallengeIndex).to.eql(-1);
        } else {
          expect(foundChallengeIndex).to.eql(10 - index);
        }
      });

      const newChallenge = await generateChallenge(user, group);
      await user.post(`/challenges/${newChallenge._id}/join`);

      challenges = await user.get('/challenges/user?page=0');

      const foundChallengeIndex = _.findIndex(challenges, { _id: newChallenge._id });
      expect(foundChallengeIndex).to.eql(1);
    });
  });

  context('filters and paging', () => {
    let user; let guild; let
      member;
    const categories = [{
      slug: 'newCat',
      name: 'New Category',
    }];

    before(async () => {
      const { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestGuild',
          type: 'guild',
          privacy: 'private',
        },
        members: 1,
        upgradeToGroupPlan: true,
      });

      user = groupLeader;
      guild = group;
      member = members[0]; // eslint-disable-line prefer-destructuring

      await user.update({ balance: 20 });

      for (let i = 0; i < 11; i += 1) {
        let challenge = await generateChallenge(user, group); // eslint-disable-line
        await user.post(`/challenges/${challenge._id}/join`); // eslint-disable-line
      }
    });

    it('returns public guilds filtered by category', async () => {
      const categoryChallenge = await generateChallenge(user, guild, { categories });
      await user.post(`/challenges/${categoryChallenge._id}/join`);
      const challenges = await user.get(`/challenges/user?page=0&categories=${categories[0].slug}`);

      expect(challenges[0]._id).to.eql(categoryChallenge._id);
      expect(challenges.length).to.eql(1);
    });

    it('paginates challenges', async () => {
      const challenges = await user.get('/challenges/user?page=0');
      const challengesPaged = await user.get('/challenges/user?page=1&owned=owned');

      expect(challenges.length).to.eql(10);
      expect(challengesPaged.length).to.eql(2);
    });

    it('filters by owned', async () => {
      const challenges = await member.get('/challenges/user?page=0&owned=owned');

      expect(challenges.length).to.eql(0);
    });
  });
});
