import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/unlink-one/:taskId', () => {
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
    const daily = await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.daily);
    await expect(user.post(`/tasks/unlink-one/${daily._id}`))
    .to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('fails if invalid task id', async () => {
    await expect(user.post('/tasks/unlink-one/123?keep=remove'))
    .to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('fails on task not found', async () => {
    await expect(user.post(`/tasks/unlink-one/${generateUUID()}?keep=keep`))
    .to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('fails on task unlinked to challenge', async () => {
    let daily = await user.post('/tasks/user', tasksToTest.daily);
    await expect(user.post(`/tasks/unlink-one/${daily._id}?keep=keep`))
    .to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('cantOnlyUnlinkChalTask'),
    });
  });

  it('fails on unbroken challenge', async () => {
    await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.daily);
    let [daily] = await user.get('/tasks/user');
    await expect(user.post(`/tasks/unlink-one/${daily._id}?keep=keep`))
    .to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('cantOnlyUnlinkChalTask'),
    });
  });

  it('unlinks a task from a challenge and saves it on keep=keep', async () => {
    await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.daily);
    let [, daily] = await user.get('/tasks/user');
    await user.del(`/challenges/${challenge._id}`);
    await user.post(`/tasks/unlink-one/${daily._id}?keep=keep`);
    [, daily] = await user.get('/tasks/user');
    expect(daily.challenge).to.eql({});
  });

  it('unlinks a task from a challenge and deletes it on keep=remove', async () => {
    await user.post(`/tasks/challenge/${challenge._id}`, tasksToTest.daily);
    let [, daily] = await user.get('/tasks/user');
    await user.del(`/challenges/${challenge._id}`);
    await user.post(`/tasks/unlink-one/${daily._id}?keep=remove`);
    const tasks = await user.get('/tasks/user');
    // Only the default task should remain
    expect(tasks.length).to.eql(1);
  });
});