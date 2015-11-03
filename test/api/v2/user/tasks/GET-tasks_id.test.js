import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('GET /user/tasks/:id', () => {
  let api, user, task;

  beforeEach(() => {
    return generateUser().then((_user) => {
      user = _user;
      task = user.todos[0];
      api = requester(user);
    });
  });

  it('gets a task', () => {
    return api.get(`/user/tasks/${task.id}`).then((foundTask) => {
      expect(foundTask.id).to.eql(task.id);
      expect(foundTask.text).to.eql(task.text);
      expect(foundTask.notes).to.eql(task.notes);
      expect(foundTask.value).to.eql(task.value);
      expect(foundTask.type).to.eql(task.type);
    });
  });

  it('returns an error if the task does not exist', () => {
    return expect(api.get('/user/tasks/task-that-does-not-exist'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        text: t('messageTaskNotFound'),
    });
  });

  it('does not get another user\'s task', () => {
    return expect(generateUser().then((otherUser) => {
      let otherUsersTask = otherUser.todos[0];
      return api.get(`/user/tasks/${otherUsersTask.id}`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      text: t('messageTaskNotFound'),
    });
  });
});
