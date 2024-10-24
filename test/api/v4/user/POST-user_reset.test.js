import { find } from 'lodash';
import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../helpers/api-integration/v4';

const RESET_CONFIRMATION = 'RESET';

describe('POST /user/reset', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('resets user\'s habits', async () => {
    const task = await user.post('/tasks/user', {
      text: 'test habit',
      type: 'habit',
    });

    await user.post('/user/reset', {
      password: 'password',
    });
    await user.sync();

    await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('messageTaskNotFound'),
    });

    expect(user.tasksOrder.habits).to.be.empty;
  });

  it('resets user\'s dailys', async () => {
    const task = await user.post('/tasks/user', {
      text: 'test daily',
      type: 'daily',
    });

    await user.post('/user/reset', {
      password: 'password',
    });
    await user.sync();

    await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('messageTaskNotFound'),
    });

    expect(user.tasksOrder.dailys).to.be.empty;
  });

  it('resets user\'s todos', async () => {
    const task = await user.post('/tasks/user', {
      text: 'test todo',
      type: 'todo',
    });

    await user.post('/user/reset', {
      password: 'password',
    });
    await user.sync();

    await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('messageTaskNotFound'),
    });

    expect(user.tasksOrder.todos).to.be.empty;
  });

  it('resets user\'s rewards', async () => {
    const task = await user.post('/tasks/user', {
      text: 'test reward',
      type: 'reward',
    });

    await user.post('/user/reset', {
      password: 'password',
    });
    await user.sync();

    await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('messageTaskNotFound'),
    });

    expect(user.tasksOrder.rewards).to.be.empty;
  });

  it('does not allow to reset if the password is missing', async () => {
    await expect(user.post('/user/reset', {
      password: '',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('missingPassword'),
    });
  });

  it('does not allow to reset if the password is wrong', async () => {
    await expect(user.post('/user/reset', {
      password: 'passdw',
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('wrongPassword'),
    });
  });

  it('does not delete challenge or group tasks', async () => {
    const guild = await generateGroup(user, {}, { 'purchased.plan.customerId': 'group-unlimited' });
    const challenge = await generateChallenge(user, guild);
    await user.post(`/challenges/${challenge._id}/join`);
    await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test challenge habit',
      type: 'habit',
    });

    const groupTask = await user.post(`/tasks/group/${guild._id}`, {
      text: 'todo group',
      type: 'todo',
    });
    await user.post(`/tasks/${groupTask._id}/assign`, [user._id]);

    await user.post('/user/reset', {
      password: 'password',
    });
    await user.sync();

    await user.put('/user', {
      'preferences.tasks.mirrorGroupTasks': [guild._id],
    });
    const memberTasks = await user.get('/tasks/user');

    const syncedGroupTask = find(memberTasks, memberTask => memberTask.group.id === guild._id);

    const userChallengeTask = find(
      memberTasks,
      memberTask => memberTask.challenge.id === challenge._id,
    );

    expect(userChallengeTask).to.exist;
    expect(syncedGroupTask).to.exist;
  });

  it('does not delete secret', async () => {
    const admin = await generateUser({
      permissions: { userSupport: true },
    });

    const hero = await generateUser({
      contributor: { level: 1 },
      secret: {
        text: 'Super-Hero',
      },
    });

    await user.post('/user/reset', {
      password: 'password',
    });

    const heroRes = await admin.get(`/hall/heroes/${hero.auth.local.username}`);

    expect(heroRes.secret).to.exist;
    expect(heroRes.secret.text).to.be.eq('Super-Hero');
  });

  context('user with Google auth', async () => {
    beforeEach(async () => {
      user = await generateUser({
        auth: {
          google: {
            id: 'google-id',
          },
        },
      });
    });

    it('resets a Google user', async () => {
      const task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });

      await user.post('/user/reset', {
        password: RESET_CONFIRMATION,
      });
      await user.sync();

      await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageTaskNotFound'),
      });

      expect(user.tasksOrder.habits).to.be.empty;
    });
  });

  context('user with Apple auth', async () => {
    beforeEach(async () => {
      user = await generateUser({
        auth: {
          apple: {
            id: 'apple-id',
          },
        },
      });
    });

    it('resets an Apple user', async () => {
      const task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });

      await user.post('/user/reset', {
        password: RESET_CONFIRMATION,
      });
      await user.sync();

      await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageTaskNotFound'),
      });

      expect(user.tasksOrder.habits).to.be.empty;
    });
  });
});
