import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('PUT /user/tasks/:id', () => {
  let api, user, task;

  beforeEach(() => {
    return generateUser().then((_user) => {
      user = _user;
      api = requester(user);
      task = user.todos[0];
    });
  });

  it('does not update the id of the task', () => {
    return api.put(`/user/tasks/${task.id}`, {
      id: 'some-thing',
    }).then((updatedTask) => {
      expect(updatedTask.id).to.eql(task.id);
      expect(updatedTask.id).to.not.eql('some-thing');
    });
  });

  it('does not update the type of the task', () => {
    return api.put(`/user/tasks/${task.id}`, {
      type: 'habit',
    }).then((updatedTask) => {
      expect(updatedTask.type).to.eql(task.type);
      expect(updatedTask.type).to.not.eql('habit');
    });
  });

  it('updates text, attribute, priority, value and notes', () => {
    return api.put(`/user/tasks/${task.id}`, {
      text: 'new text',
      notes: 'new notes',
      value: 10000,
      priority: .5,
      attribute: 'str',
    }).then((updatedTask) => {
      expect(updatedTask.text).to.eql('new text');
      expect(updatedTask.notes).to.eql('new notes');
      expect(updatedTask.value).to.eql(10000);
      expect(updatedTask.priority).to.eql(.5);
      expect(updatedTask.attribute).to.eql('str');
    });
  });

  it('returns an error if the task does not exist', () => {
    return expect(api.put('/user/tasks/task-id-that-does-not-exist'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        text: 'Task not found.',
      });
  });

  it('does not update another user\'s task', () => {
    return expect(generateUser().then((otherUser) => {
      let otherUsersTask = otherUser.todos[0];
      return api.put(`/user/tasks/${otherUsersTask._id}`, {
        name: 'some name',
      });
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      text: 'Task not found.',
    });
  });
});
