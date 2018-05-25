import {
  generateUser,
  generateGroup,
  generateChallenge,
  sleep,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /tasks/:id', () => {
  let user;
  let guild;
  let challenge;
  let task;

  before(async () => {
    user = await generateUser();
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
  });

  beforeEach(async () => {
    task = await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test habit',
      type: 'habit',
    });
  });

  it('cannot delete a non-existant task', async () => {
    await expect(user.del(`/tasks/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('returns error when user is not leader of the challenge', async () => {
    let anotherUser = await generateUser();

    await expect(anotherUser.del(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('onlyChalLeaderEditTasks'),
    });
  });

  it('deletes a user\'s task', async () => {
    await user.del(`/tasks/${task._id}`);

    await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  context('challenge member', () => {
    let anotherUser;
    let anotherUsersNewChallengeTaskID;
    let newChallengeTask;

    beforeEach(async () => {
      anotherUser = await generateUser();
      await user.post(`/groups/${guild._id}/invite`, { uuids: [anotherUser._id] });
      await anotherUser.post(`/groups/${guild._id}/join`);
      await anotherUser.post(`/challenges/${challenge._id}/join`);

      newChallengeTask = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test habit',
        type: 'habit',
      });

      let anotherUserWithNewChallengeTask = await anotherUser.get('/user');
      anotherUsersNewChallengeTaskID = anotherUserWithNewChallengeTask.tasksOrder.habits[0];
    });

    it('returns error when user attempts to delete an active challenge task', async () => {
      await expect(anotherUser.del(`/tasks/${anotherUsersNewChallengeTaskID}`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('cantDeleteChallengeTasks'),
        });
    });

    it('allows user to delete challenge task after user leaves challenge', async () => {
      await anotherUser.post(`/challenges/${challenge._id}/leave`);

      await anotherUser.del(`/tasks/${anotherUsersNewChallengeTaskID}`);

      await expect(anotherUser.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    // TODO for some reason this test fails on TravisCI, review after mongodb indexes have been added
    xit('allows user to delete challenge task after challenge task is broken', async () => {
      await expect(user.del(`/tasks/${newChallengeTask._id}`));

      await sleep(2);

      await expect(anotherUser.del(`/tasks/${anotherUsersNewChallengeTaskID}`));

      await sleep(2);

      await expect(anotherUser.get(`/tasks/${anotherUsersNewChallengeTaskID}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });
  });
});
