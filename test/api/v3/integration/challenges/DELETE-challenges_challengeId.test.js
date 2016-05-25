import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  sleep,
  checkExistence,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /challenges/:challengeId', () => {
  it('returns error when challengeId is not a valid UUID', async () => {
    let user = await generateUser();
    await expect(user.del('/challenges/test')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error when challengeId is not for a valid challenge', async () => {
    let user = await generateUser();

    await expect(user.del(`/challenges/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  context('Deleting a valid challenge', () => {
    let groupLeader;
    let group;
    let challenge;
    let taskText = 'A challenge task text';

    beforeEach(async () => {
      let populatedGroup = await createAndPopulateGroup();

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;

      challenge = await generateChallenge(groupLeader, group);

      await groupLeader.post(`/tasks/challenge/${challenge._id}`, [
        {type: 'habit', text: taskText},
      ]);

      await challenge.sync();
    });

    it('returns an error when user doesn\'t have permissions to delete the challenge', async () => {
      let user = await generateUser();

      await expect(user.del(`/challenges/${challenge._id}`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyLeaderDeleteChal'),
      });
    });

    it('deletes challenge', async () => {
      await groupLeader.del(`/challenges/${challenge._id}`);

      await sleep(0.5);

      await expect(checkExistence('challenges', challenge._id)).to.eventually.equal(false);
    });

    it('refunds gems to group leader', async () => {
      let oldBalance = (await groupLeader.sync()).balance;

      await groupLeader.del(`/challenges/${challenge._id}`);

      await sleep(0.5);

      await expect(groupLeader.sync()).to.eventually.have.property('balance', oldBalance + challenge.prize / 4);
    });

    it('sets broken and doesn\'t set winner flags for user\'s challenge tasks', async () => {
      await groupLeader.del(`/challenges/${challenge._id}`);

      await sleep(0.5);

      let tasks = await groupLeader.get('/tasks/user');
      let testTask = _.find(tasks, (task) => {
        return task.text === taskText;
      });

      expect(testTask.challenge.broken).to.eql('CHALLENGE_DELETED');
      expect(testTask.challenge.winner).to.be.null;
    });
  });
});
