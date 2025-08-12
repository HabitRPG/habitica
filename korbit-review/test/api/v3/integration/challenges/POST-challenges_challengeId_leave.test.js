import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  generateChallenge,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /challenges/:challengeId/leave', () => {
  it('returns error when challengeId is not a valid UUID', async () => {
    const user = await generateUser();

    await expect(user.post('/challenges/test/leave')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error when challengeId is not for a valid challenge', async () => {
    const user = await generateUser();

    await expect(user.post(`/challenges/${generateUUID()}/leave`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  context('Leaving a valid challenge', () => {
    let groupLeader;
    let group;
    let challenge;
    let notInChallengeUser;
    let notInGroupLeavingUser;
    let leavingUser;
    let taskText;

    beforeEach(async () => {
      const populatedGroup = await createAndPopulateGroup({
        members: 3,
      });

      groupLeader = populatedGroup.groupLeader;
      group = populatedGroup.group;
      leavingUser = populatedGroup.members[0]; // eslint-disable-line prefer-destructuring
      notInChallengeUser = populatedGroup.members[1]; // eslint-disable-line prefer-destructuring
      notInGroupLeavingUser = populatedGroup.members[2]; // eslint-disable-line prefer-destructuring

      challenge = await generateChallenge(groupLeader, group);
      await groupLeader.post(`/challenges/${challenge._id}/join`);

      taskText = 'A challenge task text';

      await groupLeader.post(`/tasks/challenge/${challenge._id}`, [
        { type: 'habit', text: taskText },
      ]);

      await leavingUser.post(`/challenges/${challenge._id}/join`);

      await notInGroupLeavingUser.post(`/challenges/${challenge._id}/join`);
      await notInGroupLeavingUser.post(`/groups/${group._id}/leave`, {
        keepChallenges: 'remain-in-challenges',
      });

      await challenge.sync();
    });

    it('lets user leave when not a member of the challenge group', async () => {
      await expect(notInGroupLeavingUser.post(`/challenges/${challenge._id}/leave`)).to.eventually.be.ok;
    });

    it('returns an error when user isn\'t a member of the challenge', async () => {
      await expect(notInChallengeUser.post(`/challenges/${challenge._id}/leave`)).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('challengeMemberNotFound'),
      });
    });

    it('removes challenge from user challenges', async () => {
      await leavingUser.post(`/challenges/${challenge._id}/leave`);

      await leavingUser.sync();

      expect(leavingUser).to.have.property('challenges').to.not.include(challenge._id);
    });

    it('decreases memberCount of challenge', async () => {
      const oldMemberCount = challenge.memberCount;

      await leavingUser.post(`/challenges/${challenge._id}/leave`);

      await challenge.sync();

      expect(challenge).to.have.property('memberCount', oldMemberCount - 1);
    });

    it('unlinks challenge tasks from leaving user when remove-all is passed', async () => {
      await leavingUser.post(`/challenges/${challenge._id}/leave`, {
        keep: 'remove-all',
      });
      const tasks = await leavingUser.get('/tasks/user');
      const tasksTexts = tasks.map(task => task.text);

      expect(tasksTexts).to.not.include(taskText);
    });

    it('doesn\'t unlink challenge tasks from leaving user when remove-all isn\'t passed', async () => {
      await leavingUser.post(`/challenges/${challenge._id}/leave`, {
        keep: 'test',
      });

      const tasks = await leavingUser.get('/tasks/user');
      const testTask = _.find(tasks, task => task.text === taskText);

      expect(testTask).to.not.be.undefined;
    });
  });
});
