import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST /challenges', () => {
  it('returns error when group is empty', async () => {
    let user = await generateUser();

    await expect(user.post('/challenges')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error when groupId is not for a valid group', async () => {
    let user = await generateUser();

    await expect(user.post('/challenges', {
      group: generateUUID(),
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('returns error when creating a challenge in the tavern with no prize', async () => {
    let user = await generateUser();

    await expect(user.post('/challenges', {
      group: 'habitrpg',
      prize: 0,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('tavChalsMinPrize'),
    });
  });

  it('returns error when creating a challenge in a public guild and you are not a member of it', async () => {
    let user = await generateUser();
    let { group } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'public',
      },
    });

    await expect(user.post('/challenges', {
      group: group._id,
      prize: 4,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('mustBeGroupMember'),
    });
  });

  context('Creating a challenge for a valid group', () => {
    let groupLeader;
    let group;
    let groupMember;

    beforeEach(async () => {
      let populatedGroup = await createAndPopulateGroup({
        members: 1,
        leaderDetails: {
          balance: 3,
        },
        groupDetails: {
          type: 'guild',
          leaderOnly: {
            challenges: true,
          },
        },
      });

      groupLeader = await populatedGroup.groupLeader.sync();
      group = populatedGroup.group;
      groupMember = populatedGroup.members[0];
    });

    it('returns an error when non-leader member creates a challenge in leaderOnly group', async () => {
      await expect(groupMember.post('/challenges', {
        group: group._id,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyGroupLeaderChal'),
      });
    });

    it('allows non-leader member to create a challenge', async () => {
      let populatedGroup = await createAndPopulateGroup({
        members: 1,
      });

      group = populatedGroup.group;
      groupMember = populatedGroup.members[0];

      let chal = await groupMember.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
      });

      expect(chal.leader).to.eql({
        _id: groupMember._id,
        profile: {name: groupMember.profile.name},
      });
    });

    it('doesn\'t take gems from user or group when challenge has no prize', async () => {
      let oldUserBalance = groupLeader.balance;
      let oldGroupBalance = group.balance;

      await groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
        prize: 0,
      });

      await expect(groupLeader.sync()).to.eventually.have.property('balance', oldUserBalance);
      await expect(group.sync()).to.eventually.have.property('balance', oldGroupBalance);
    });

    it('returns error when user and group can\'t pay prize', async () => {
      await expect(groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
        prize: 20,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cantAfford'),
      });
    });

    it('takes prize out of group if it has sufficient funds', async () => {
      let oldUserBalance = groupLeader.balance;
      let oldGroupBalance = group.balance;
      let prize = 4;

      await groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
        prize,
      });

      await expect(group.sync()).to.eventually.have.property('balance', oldGroupBalance - prize / 4);
      await expect(groupLeader.sync()).to.eventually.have.property('balance', oldUserBalance);
    });

    it('takes prize out of both group and user if group doesn\'t have enough', async () => {
      let oldUserBalance = groupLeader.balance;
      let prize = 8;

      await groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
        prize,
      });

      await expect(group.sync()).to.eventually.have.property('balance', 0);
      await expect(groupLeader.sync()).to.eventually.have.property('balance', oldUserBalance - (prize / 4  - 1));
    });

    it('takes prize out of user if group has no balance', async () => {
      let oldUserBalance = groupLeader.balance;
      let prize = 8;

      await group.update({ balance: 0});
      await groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
        prize,
      });

      await expect(group.sync()).to.eventually.have.property('balance', 0);
      await expect(groupLeader.sync()).to.eventually.have.property('balance', oldUserBalance - prize / 4);
    });

    it('increases challenge count of group', async () => {
      let oldChallengeCount = group.challengeCount;

      await groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
      });

      await expect(group.sync()).to.eventually.have.property('challengeCount', oldChallengeCount + 1);
    });

    it('sets challenge as official if created by admin and official flag is set', async () => {
      await groupLeader.update({
        contributor: {
          admin: true,
        },
      });

      let challenge = await groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
        official: true,
      });

      expect(challenge.official).to.eql(true);
    });

    it('doesn\'t set challenge as official if official flag is set by non-admin', async () => {
      let challenge = await groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
        official: true,
      });

      expect(challenge.official).to.eql(false);
    });

    it('returns an error when challenge validation fails; doesn\'s save user or group', async () => {
      let oldChallengeCount = group.challengeCount;
      let oldUserBalance = groupLeader.balance;
      let oldGroupBalance = group.balance;

      await expect(groupLeader.post('/challenges', {
        group: group._id,
        prize: 8,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Challenge validation failed',
      });

      group = await group.sync();
      groupLeader = await groupLeader.sync();

      expect(group.challengeCount).to.eql(oldChallengeCount);
      expect(group.balance).to.eql(oldGroupBalance);
      expect(groupLeader.balance).to.eql(oldUserBalance);
    });

    it('sets all properites of the challenge as passed', async () => {
      let name = 'Test Challenge';
      let shortName = 'TC Label';
      let description = 'Test Description';
      let prize = 4;

      let challenge = await groupLeader.post('/challenges', {
        group: group._id,
        name,
        shortName,
        description,
        prize,
      });

      expect(challenge.leader).to.eql({
        _id: groupLeader._id,
        profile: {name: groupLeader.profile.name},
      });
      expect(challenge.name).to.eql(name);
      expect(challenge.shortName).to.eql(shortName);
      expect(challenge.description).to.eql(description);
      expect(challenge.official).to.eql(false);
      expect(challenge.group).to.eql({
        _id: group._id,
        privacy: group.privacy,
        name: group.name,
        type: group.type,
      });
      expect(challenge.memberCount).to.eql(0);
      expect(challenge.prize).to.eql(prize);
    });

    it('does not add challenge to creator\'s challenges', async () => {
      await groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
      });

      await groupLeader.sync();
      expect(groupLeader.challenges.length).to.equal(0);
    });

    it('does not award joinedChallenge achievement for creating a challenge', async () => {
      await groupLeader.post('/challenges', {
        group: group._id,
        name: 'Test Challenge',
        shortName: 'TC Label',
      });
      groupLeader = await groupLeader.sync();
      expect(groupLeader.achievements.joinedChallenge).to.not.be.true;
    });

    it('sets summary to challenges name when not supplied', async () => {
      const name = 'Test Challenge';
      const challenge = await groupLeader.post('/challenges', {
        group: group._id,
        name,
        shortName: 'TC Label',
      });

      const updatedChallenge = await groupLeader.get(`/challenges/${challenge._id}`);

      expect(updatedChallenge.summary).to.eql(name);
    });

    it('sets summary to challenges', async () => {
      const name = 'Test Challenge';
      const summary = 'Test Summary Challenge';
      const challenge = await groupLeader.post('/challenges', {
        group: group._id,
        name,
        shortName: 'TC Label',
        summary,
      });

      const updatedChallenge = await groupLeader.get(`/challenges/${challenge._id}`);

      expect(updatedChallenge.summary).to.eql(summary);
    });
  });
});
