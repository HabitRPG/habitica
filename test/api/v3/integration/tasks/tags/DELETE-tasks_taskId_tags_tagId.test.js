import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('DELETE /tasks/:taskId/tags/:tagId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('removes a tag from a task', async () => {
    const task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    });

    const tag = await user.post('/tags', { name: 'Tag 1' });

    await user.post(`/tasks/${task._id}/tags/${tag.id}`);
    await user.del(`/tasks/${task._id}/tags/${tag.id}`);

    const updatedTask = await user.get(`/tasks/${task._id}`);

    expect(updatedTask.tags.length).to.equal(0);
  });

  it('removes a tag from a task using task short name', async () => {
    const task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
      alias: 'habit-with-alias',
    });

    const tag = await user.post('/tags', { name: 'Tag 1' });

    await user.post(`/tasks/${task._id}/tags/${tag.id}`);
    await user.del(`/tasks/${task.alias}/tags/${tag.id}`);

    const updatedTask = await user.get(`/tasks/${task._id}`);

    expect(updatedTask.tags.length).to.equal(0);
  });

  it('only deletes existing tags', async () => {
    const createdTask = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    });

    await expect(user.del(`/tasks/${createdTask._id}/tags/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('tagNotFound'),
    });
  });
});
