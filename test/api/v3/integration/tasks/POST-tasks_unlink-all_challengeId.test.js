import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /tasks/unlink-all/:challengeId', () => {
  let user;
  let guild;
  let challenge;
  let tasksToTest = {
    habit: {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
    },
    todo: {
      text: 'test todo',
      type: 'todo',
    },
    daily: {
      text: 'test daily',
      type: 'daily',
      frequency: 'daily',
      everyX: 5,
      startDate: new Date(),
    },
    reward: {
      text: 'test reward',
      type: 'reward',
    },
  };

  beforeEach(async () => {
    user = await generateUser();
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
  });

  it('fails if no keep query', async () => {
    await expect(user.post(`/tasks/unlink-all/${challenge._id}`))
    .to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('fails if invalid challenge id', async () => {
    await expect(user.post('/tasks/unlink-all/123?keep=remove-all'))
    .to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('fails on an unbroken challenge', async () => {
    await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.daily);
    await expect(user.post(`/tasks/unlink-all/${challenge._id}?keep=remove-all`))
    .to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('cantOnlyUnlinkChalTask'),
    });
  });

  it('unlinks all tasks from a challenge and deletes them on keep=remove-all', async () => {
    const daily = await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.daily);
    await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.habit);
    await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.reward);
    await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.todo);
    await user.del(`/challenges/${challenge._id}`);
    const response = await user.post(`/tasks/unlink-all/${challenge._id}?keep=remove-all`);
    expect(response).to.eql({});

    await expect(user.get(`/tasks/${daily._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('unlinks a task from a challenge on keep=keep-all', async () => {
    const daily = await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.daily);
    const anotherUser = await generateUser();
    await user.post(`/groups/${guild._id}/invite`, {
        uuids: [anotherUser._id],
    });
    // Have the second user join the group and challenge
    await anotherUser.post(`/groups/${guild._id}/join`);
    await anotherUser.post(`/challenges/${challenge._id}/join`);
    // Have the leader delete the challenge and unlink the tasks
    await user.del(`/challenges/${challenge._id}`);
    await user.post(`/tasks/unlink-all/${challenge._id}?keep=keep-all`);
    // Get the task for the second user
    const [, anotherUserTask] = await anotherUser.get('/tasks/user');
    // Expect the second user to still have the task, but unlinked
    expect(anotherUserTask.challenge).to.eql({
      taskId: daily._id,
      id: challenge._id,
      shortName: challenge.shortName,
      broken: 'CHALLENGE_DELETED',
      winner: null,
    });
  });
});
