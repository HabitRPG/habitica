import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  sleep,
  checkExistence,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /challenges/:challengeId/winner/:winnerId', () => {
  it('returns error when challengeId is not a valid UUID', async () => {
    let user = await generateUser();

    await expect(user.post(`/challenges/test/selectWinner/${user._id}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error when winnerId is not a valid UUID', async () => {
    let user = await generateUser();

    await expect(user.post(`/challenges/${generateUUID()}/selectWinner/test`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error when challengeId is not for a valid challenge', async () => {
    let user = await generateUser();

    await expect(user.post(`/challenges/${generateUUID()}/selectWinner/${user._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  context('Selecting winner for a valid challenge', () => {
    let groupLeader;
    let group;
    let challenge;
    let winningUser;
    let taskText = 'A challenge task text';

    beforeEach(async () => {
      let populatedGroup = await createAndPopulateGroup({
        members: 1,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      winningUser = populatedGroup.members[0];

      challenge = await generateChallenge(groupLeader, group, {
        prize: 1,
      });

      await groupLeader.post(`/tasks/challenge/${challenge._id}`, [
        {type: 'habit', text: taskText},
      ]);

      await winningUser.post(`/challenges/${challenge._id}/join`);

      await challenge.sync();
    });

    it('returns an error when user doesn\'t have permissions to select winner', async () => {
      await expect(winningUser.post(`/challenges/${challenge._id}/selectWinner/${winningUser._id}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyLeaderDeleteChal'),
      });
    });

    it('returns an error when winning user isn\'t part of the challenge', async () => {
      let notInChallengeUser = await generateUser();

      await expect(groupLeader.post(`/challenges/${challenge._id}/selectWinner/${notInChallengeUser._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('winnerNotFound', {userId: notInChallengeUser._id}),
      });
    });

    it('deletes challenge after winner is selected', async () => {
      await groupLeader.post(`/challenges/${challenge._id}/selectWinner/${winningUser._id}`);

      await sleep(0.5);

      await expect(checkExistence('challenges', challenge._id)).to.eventually.equal(false);
    });

    it('adds challenge to winner\'s achievements', async () => {
      await groupLeader.post(`/challenges/${challenge._id}/selectWinner/${winningUser._id}`);

      await sleep(0.5);

      await expect(winningUser.sync()).to.eventually.have.deep.property('achievements.challenges').to.include(challenge.name);
      expect(winningUser.notifications.length).to.equal(2); // 2 because winningUser just joined the challenge, which now awards an achievement
      expect(winningUser.notifications[1].type).to.equal('WON_CHALLENGE');
    });

    it('gives winner gems as reward', async () => {
      let oldBalance = winningUser.balance;

      await groupLeader.post(`/challenges/${challenge._id}/selectWinner/${winningUser._id}`);

      await sleep(0.5);

      await expect(winningUser.sync()).to.eventually.have.property('balance', oldBalance + challenge.prize / 4);
    });

    it('doesn\'t gives winner gems if group policy prevents it', async () => {
      let oldBalance = winningUser.balance;
      let oldLeaderBalance = (await groupLeader.sync()).balance;

      await winningUser.update({
        'purchased.plan.customerId': 'group-plan',
      });
      await group.update({
        'leaderOnly.getGems': true,
        'purchased.plan.customerId': 123,
      });

      await groupLeader.post(`/challenges/${challenge._id}/selectWinner/${winningUser._id}`);

      await sleep(0.5);

      await expect(winningUser.sync()).to.eventually.have.property('balance', oldBalance);
      await expect(groupLeader.sync()).to.eventually.have.property('balance', oldLeaderBalance + challenge.prize / 4);
    });

    it('doesn\'t refund gems to group leader', async () => {
      let oldBalance = (await groupLeader.sync()).balance;

      await groupLeader.post(`/challenges/${challenge._id}/selectWinner/${winningUser._id}`);

      await sleep(0.5);

      await expect(groupLeader.sync()).to.eventually.have.property('balance', oldBalance);
    });

    it('sets broken and winner flags for user\'s challenge tasks', async () => {
      await groupLeader.post(`/challenges/${challenge._id}/selectWinner/${winningUser._id}`);

      await sleep(0.5);

      const tasks = await winningUser.get('/tasks/user');
      const testTask = _.find(tasks, (task) => {
        return task.text === taskText;
      });

      const updatedUser = await winningUser.sync();
      const challengeTag = updatedUser.tags.find(tags => {
        return tags.id === challenge._id;
      });

      expect(testTask.challenge.broken).to.eql('CHALLENGE_CLOSED');
      expect(testTask.challenge.winner).to.eql(winningUser.profile.name);
      expect(challengeTag.challenge).to.eql('false');
    });
  });
});
