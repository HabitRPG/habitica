import {
  generateUser,
  generateGroup,
  createAndPopulateGroup,
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
    try {
      await user.post(`/tasks/unlink-all/${challenge._id}`);
    } catch (err) {
      expect(err).to.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    }
  });

  it('fails if invalid challenge id', async () => {
    try {
      await user.post('/tasks/unlink-all/123?keep=remove-all');
    } catch (err) {
      expect(err).to.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    }
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

  it.only('unlinks a task from a challenge on keep=keep-all', async () => {
    /*
      NOTE: I expected keep-all to preserve the tasks, but if I try to GET them by _id afterwards they are gone
      Is this intended behavior? What is keep-all supposed to do?
      From what I can tell the tasks are gone for this user
    */
    const { groupLeader, group, members } = await createAndPopulateGroup({ members: 1 });
    const [follower] = members;
    const newChallenge = await generateChallenge(groupLeader, group);
    const thisTask = await groupLeader.post(`/tasks/challenge/${newChallenge._id}`, tasksToTest.daily);

    // This gives:  Only the challenge leader can delete it.
    await groupLeader.del(`/challenges/${challenge._id}`);
    /*
    const response = await groupLeader.post(`/tasks/unlink-all/${challenge._id}?keep=keep-all`);
    expect(response).to.eql({});
    const keptTask = await follower.get(`/tasks/${thisTask._id}`);
    console.log(keptTask); */
    // expect(response).to.eql({});
  });
});