import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { find } from 'lodash';

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

  it('does not delete challenge or group tasks', async () => {
    let guild = await generateGroup(user);
    let challenge = await generateChallenge(user, guild);
    await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test challenge habit',
      type: 'habit',
    });

    let groupTask = await user.post(`/tasks/group/${guild._id}`, {
      text: 'todo group',
      type: 'todo',
    });
    await user.post(`/tasks/${groupTask._id}/assign/${user._id}`);

    await user.post('/user/reset');
    await user.sync();

    let memberTasks = await user.get('/tasks/user');

    let syncedGroupTask = find(memberTasks, function findAssignedTask (memberTask) {
      return memberTask.group.id === guild._id;
    });

    let userChallengeTask = find(memberTasks, function findAssignedTask (memberTask) {
      return memberTask.challenge.id === challenge._id;
    });

    expect(userChallengeTask).to.exist;
    expect(syncedGroupTask).to.exist;
  });
});
