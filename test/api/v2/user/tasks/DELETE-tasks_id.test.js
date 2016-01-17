import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v2';

describe('DELETE /user/tasks/:id', () => {
  let user, task;

  beforeEach(async () => {
    user = await generateUser();
    task = user.todos[0];
  });

  it('deletes a task', async () => {
    await user.del(`/user/tasks/${task.id}`);

    await expect(user.get(`/user/tasks/${task.id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      text: t('messageTaskNotFound'),
    });
  });

  it('returns an error if the task does not exist', async () => {
    return expect(user.del('/user/tasks/task-that-does-not-exist'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        text: t('messageTaskNotFound'),
      });
  });

  it('does not delete another user\'s task', async () => {
    return expect(generateUser().then((otherUser) => {
      let otherUsersTask = otherUser.todos[0];
      return user.del(`/user/tasks/${otherUsersTask.id}`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      text: 'Task not found.',
    });
  });
});
