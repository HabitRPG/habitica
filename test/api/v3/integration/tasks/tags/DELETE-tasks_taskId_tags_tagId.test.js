import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /tasks/:taskId/tags/:tagId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('removes a tag from a task', async () => {
    let task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    });

    let tag = await user.post('/tags', {name: 'Tag 1'});

    await user.post(`/tasks/${task._id}/tags/${tag.id}`);
    await user.del(`/tasks/${task._id}/tags/${tag.id}`);

    let updatedTask = await user.get(`/tasks/${task._id}`);

    expect(updatedTask.tags.length).to.equal(0);
  });

  it('removes a tag from a task using task short name', async () => {
    let task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
      alias: 'habit-with-alias',
    });

    let tag = await user.post('/tags', {name: 'Tag 1'});

    await user.post(`/tasks/${task._id}/tags/${tag.id}`);
    await user.del(`/tasks/${task.alias}/tags/${tag.id}`);

    let updatedTask = await user.get(`/tasks/${task._id}`);

    expect(updatedTask.tags.length).to.equal(0);
  });

  it('only deletes existing tags', async () => {
    let createdTask = await user.post('/tasks/user', {
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
