import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('DELETE /tasks/:id', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  context('task can be deleted', () => {
    let task;

    beforeEach(async () => {
      task = await user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
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
      let task2 = await anotherUser.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      });

      await expect(user.del(`/tasks/${task2._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('cannot delete active challenge tasks'); // TODO after challenges are implemented
    it('remove a task from user.tasksOrder'); // TODO
  });
});
