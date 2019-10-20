import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /tasks/:taskId/tags/:tagId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('adds a tag to a task', async () => {
    const task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    });

    const tag = await user.post('/tags', { name: 'Tag 1' });
    const savedTask = await user.post(`/tasks/${task._id}/tags/${tag.id}`);

    expect(savedTask.tags[0]).to.equal(tag.id);
  });

  it('adds a tag to a task with alias', async () => {
    const task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
      alias: 'habit-with-alias',
    });

    const tag = await user.post('/tags', { name: 'Tag 1' });
    const savedTask = await user.post(`/tasks/${task.alias}/tags/${tag.id}`);

    expect(savedTask.tags[0]).to.equal(tag.id);
  });

  it('does not add a tag to a task twice', async () => {
    const task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    });

    const tag = await user.post('/tags', { name: 'Tag 1' });

    await user.post(`/tasks/${task._id}/tags/${tag.id}`);

    await expect(user.post(`/tasks/${task._id}/tags/${tag.id}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('alreadyTagged'),
    });
  });

  it('does not add a non existing tag to a task', async () => {
    const task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    });

    await expect(user.post(`/tasks/${task._id}/tags/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });
});
