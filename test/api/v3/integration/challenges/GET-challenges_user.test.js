import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
} from '../../../../helpers/api-integration/v3';

describe('GET challenges/user', () => {
  context('no official challenges', () => {
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
      await user.post(`/challenges/${challenge._id}/join`);
      challenge2 = await generateChallenge(user, group);
      await user.post(`/challenges/${challenge2._id}/join`);
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
        auth: {
          local: {
            username: user.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
      expect(foundChallenge.group).to.eql({
        _id: publicGuild._id,
        categories: [],
        id: publicGuild._id,
        type: publicGuild.type,
        privacy: publicGuild.privacy,
        name: publicGuild.name,
        summary: publicGuild.name,
        leader: publicGuild.leader._id,
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
        auth: {
          local: {
            username: user.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
      expect(foundChallenge1.group).to.eql({
        _id: publicGuild._id,
        categories: [],
        id: publicGuild._id,
        type: publicGuild.type,
        privacy: publicGuild.privacy,
        name: publicGuild.name,
        summary: publicGuild.name,
        leader: publicGuild.leader._id,
      });
      let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
        _id: publicGuild.leader._id,
        id: publicGuild.leader._id,
        profile: {name: user.profile.name},
        auth: {
          local: {
            username: user.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
      expect(foundChallenge2.group).to.eql({
        _id: publicGuild._id,
        categories: [],
        id: publicGuild._id,
        type: publicGuild.type,
        privacy: publicGuild.privacy,
        name: publicGuild.name,
        summary: publicGuild.name,
        leader: publicGuild.leader._id,
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
        auth: {
          local: {
            username: user.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
      expect(foundChallenge1.group).to.eql({
        _id: publicGuild._id,
        categories: [],
        id: publicGuild._id,
        type: publicGuild.type,
        privacy: publicGuild.privacy,
        name: publicGuild.name,
        summary: publicGuild.name,
        leader: publicGuild.leader._id,
      });
      let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.exist;
      expect(foundChallenge2.leader).to.eql({
        _id: publicGuild.leader._id,
        id: publicGuild.leader._id,
        profile: {name: user.profile.name},
        auth: {
          local: {
            username: user.auth.local.username,
          },
        },
        flags: {
          verifiedUsername: true,
        },
      });
      expect(foundChallenge2.group).to.eql({
        _id: publicGuild._id,
        categories: [],
        id: publicGuild._id,
        type: publicGuild.type,
        privacy: publicGuild.privacy,
        name: publicGuild.name,
        summary: publicGuild.name,
        leader: publicGuild.leader._id,
      });
    });

    it('should not return challenges in user groups if we send member true param', async () => {
      let challenges = await member.get(`/challenges/user?member=${true}`);

      let foundChallenge1 = _.find(challenges, { _id: challenge._id });
      expect(foundChallenge1).to.not.exist;

      let foundChallenge2 = _.find(challenges, { _id: challenge2._id });
      expect(foundChallenge2).to.not.exist;
    });

    it('should return newest challenges first', async () => {
      let challenges = await user.get('/challenges/user');

      let foundChallengeIndex = _.findIndex(challenges, { _id: challenge2._id });
      expect(foundChallengeIndex).to.eql(0);

      let newChallenge = await generateChallenge(user, publicGuild);
      await user.post(`/challenges/${newChallenge._id}/join`);

      challenges = await user.get('/challenges/user');

      foundChallengeIndex = _.findIndex(challenges, { _id: newChallenge._id });
      expect(foundChallengeIndex).to.eql(0);
    });

    it('should not return challenges user doesn\'t have access to', async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestPrivateGuild',
          summary: 'summary for TestPrivateGuild',
          type: 'guild',
          privacy: 'private',
        },
      });

      let privateChallenge = await generateChallenge(groupLeader, group);
      await groupLeader.post(`/challenges/${privateChallenge._id}/join`);

      let challenges = await nonMember.get('/challenges/user');

      let foundChallenge = _.find(challenges, { _id: privateChallenge._id });
      expect(foundChallenge).to.not.exist;
    });

    it('should not return challenges user doesn\'t have access to, even with query parameters', async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestPrivateGuild',
          summary: 'summary for TestPrivateGuild',
          type: 'guild',
          privacy: 'private',
        },
      });

      let privateChallenge = await generateChallenge(groupLeader, group, {categories: [{
        name: 'academics',
        slug: 'academics',
      }]});
      await groupLeader.post(`/challenges/${privateChallenge._id}/join`);

      let challenges = await nonMember.get('/challenges/user?categories=academics&owned=not_owned');

      let foundChallenge = _.find(challenges, { _id: privateChallenge._id });
      expect(foundChallenge).to.not.exist;
    });
  });

  context('official challenge is present', () => {
    let user, officialChallenge, challenge, challenge2, publicGuild;

    before(async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: {
          name: 'TestGuild',
          summary: 'summary for TestGuild',
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
        categories: [{
          name: 'habitica_official',
          slug: 'habitica_official',
        }],
      });
      await user.post(`/challenges/${officialChallenge._id}/join`);

      challenge = await generateChallenge(user, group);
      await user.post(`/challenges/${challenge._id}/join`);
      challenge2 = await generateChallenge(user, group);
      await user.post(`/challenges/${challenge2._id}/join`);
    });

    it('should return official challenges first', async () => {
      let challenges = await user.get('/challenges/user');

      let foundChallengeIndex = _.findIndex(challenges, { _id: officialChallenge._id });
      expect(foundChallengeIndex).to.eql(0);
    });

    it('should return newest challenges first, after official ones', async () => {
      let challenges = await user.get('/challenges/user');

      let foundChallengeIndex = _.findIndex(challenges, { _id: challenge._id });
      expect(foundChallengeIndex).to.eql(2);

      foundChallengeIndex = _.findIndex(challenges, { _id: challenge2._id });
      expect(foundChallengeIndex).to.eql(1);

      let newChallenge = await generateChallenge(user, publicGuild);
      await user.post(`/challenges/${newChallenge._id}/join`);

      challenges = await user.get('/challenges/user');

      foundChallengeIndex = _.findIndex(challenges, { _id: newChallenge._id });
      expect(foundChallengeIndex).to.eql(1);
    });
  });

  context('filters and paging', () => {
    let user, guild, member;
    const categories = [{
      slug: 'newCat',
      name: 'New Category',
    }];

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
      guild = group;
      member = members[0];

      await user.update({balance: 20});

      for (let i = 0; i < 11; i += 1) {
        let challenge = await generateChallenge(user, group); // eslint-disable-line
        await user.post(`/challenges/${challenge._id}/join`); // eslint-disable-line
      }
    });

    it('returns public guilds filtered by category', async () => {
      const categoryChallenge = await generateChallenge(user, guild, {categories});
      await user.post(`/challenges/${categoryChallenge._id}/join`);
      const challenges = await user.get(`/challenges/user?categories=${categories[0].slug}`);

      expect(challenges[0]._id).to.eql(categoryChallenge._id);
      expect(challenges.length).to.eql(1);
    });

    it('does not page challenges if page parameter is absent', async () => {
      const challenges = await user.get('/challenges/user');

      expect(challenges.length).to.be.above(11);
    });

    it('paginates challenges', async () => {
      const challenges = await user.get('/challenges/user?page=0');
      const challengesPaged = await user.get('/challenges/user?page=1&owned=owned');

      expect(challenges.length).to.eql(10);
      expect(challengesPaged.length).to.eql(2);
    });

    it('filters by owned', async () => {
      const challenges = await member.get('/challenges/user?owned=owned');

      expect(challenges.length).to.eql(0);
    });
  });
});
