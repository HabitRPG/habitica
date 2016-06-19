import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/:taskId/tags/:tagId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('adds a tag to a task', async () => {
    let task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    });

    let tag = await user.post('/tags', {name: 'Tag 1'});
    let savedTask = await user.post(`/tasks/${task._id}/tags/${tag.id}`);

    expect(savedTask.tags[0]).to.equal(tag.id);
  });

  it('adds a tag to a task with alias', async () => {
    let task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
      alias: 'habit-with-alias',
    });

    let tag = await user.post('/tags', {name: 'Tag 1'});
    let savedTask = await user.post(`/tasks/${task.alias}/tags/${tag.id}`);

    expect(savedTask.tags[0]).to.equal(tag.id);
  });

  it('does not add a tag to a task twice', async () => {
    let task = await user.post('/tasks/user', {
      type: 'habit',
      text: 'Task with tag',
    });

    let tag = await user.post('/tags', {name: 'Tag 1'});

    await user.post(`/tasks/${task._id}/tags/${tag.id}`);

    await expect(user.post(`/tasks/${task._id}/tags/${tag.id}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('alreadyTagged'),
    });
  });

  it('does not add a non existing tag to a task', async () => {
    let task = await user.post('/tasks/user', {
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
