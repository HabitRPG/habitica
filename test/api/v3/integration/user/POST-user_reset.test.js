import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/reset', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('resets user\'s habits', async () => {
    let task = await user.post('/tasks/user', {
      text: 'test habit',
      type: 'habit',
    });

    await user.post('/user/reset');
    await user.sync();

    await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });

    expect(user.tasksOrder.habits).to.be.empty;
  });

  it('resets user\'s dailys', async () => {
    let task = await user.post('/tasks/user', {
      text: 'test daily',
      type: 'daily',
    });

    await user.post('/user/reset');
    await user.sync();

    await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });

    expect(user.tasksOrder.dailys).to.be.empty;
  });

  it('resets user\'s todos', async () => {
    let task = await user.post('/tasks/user', {
      text: 'test todo',
      type: 'todo',
    });

    await user.post('/user/reset');
    await user.sync();

    await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });

    expect(user.tasksOrder.todos).to.be.empty;
  });

  it('resets user\'s rewards', async () => {
    let task = await user.post('/tasks/user', {
      text: 'test reward',
      type: 'reward',
    });

    await user.post('/user/reset');
    await user.sync();

    await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });

    expect(user.tasksOrder.rewards).to.be.empty;
  });

  it('does not delete challenge tasks', async () => {
    let guild = await generateGroup(user);
    let challenge = await generateChallenge(user, guild);
    let task = await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test challenge habit',
      type: 'habit',
    });

    await user.post('/user/reset');
    await user.sync();

    let userChallengeTask = await user.get(`/tasks/${task._id}`);

    expect(userChallengeTask).to.eql(task);
  });

  it('keeps automaticAllocation false', async () => {
    await user.update({
      preferences: {
        automaticAllocation: false,
      },
    });

    await user.post('/user/reset');
    await user.sync();

    expect(user.preferences.automaticAllocation).to.be.false;
  });

  it('sets automaticAllocation to false when true', async () => {
    await user.update({
      preferences: {
        automaticAllocation: true,
      },
    });

    await user.post('/user/reset');
    await user.sync();

    expect(user.preferences.automaticAllocation).to.be.false;
  });
});
