import {
  generateUser,
  requester,
} from '../../../helpers/api.helper';

describe('DELETE /user/tasks/:id', () => {
  let api, user, task;

  beforeEach(() => {
    return generateUser().then((_user) => {
      user = _user;
      task = user.todos[0];
      api = requester(user);
    });
  });

  it('deletes a task', () => {
    return expect(api.del(`/user/tasks/${task.id}`)
      .then((res) => {
        return api.get(`/user/tasks/${task.id}`);
      })).to.eventually.be.rejected.and.eql({
        code: 404,
        text: 'No task found.',
    });
  });

  it('returns an error if the task does not exist', () => {
    return expect(api.del('/user/tasks/task-that-does-not-exist'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        text: 'Task not found.',
    });
  });

  it('does not delete another user\'s task', () => {
    return expect(generateUser().then((otherUser) => {
      let otherUsersTask = otherUser.todos[0];
      return api.del(`/user/tasks/${otherUsersTask.id}`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      text: 'Task not found.',
    });
  });
});
