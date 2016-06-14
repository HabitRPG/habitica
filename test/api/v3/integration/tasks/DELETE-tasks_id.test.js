import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('DELETE /tasks/:id', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('task can be deleted', () => {
    let task;

    beforeEach(async () => {
      task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
        shortName: 'task-to-be-deleted',
      });
    });

    it('deletes a user\'s task', async () => {
      await user.del(`/tasks/${task._id}`);

      await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('can use a shortName to delete a task', async () => {
      await user.del(`/tasks/${task.shortName}`);

      await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });
  });

  context('task cannot be deleted', () => {
    it('cannot delete a non-existant task', async () => {
      await expect(user.del('/tasks/550e8400-e29b-41d4-a716-446655440000')).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('cannot delete a task owned by someone else', async () => {
      let anotherUser = await generateUser();
      let anotherUsersTask = await anotherUser.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });

      await expect(user.del(`/tasks/${anotherUsersTask._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('removes a task from user.tasksOrder'); // TODO
  });
});
