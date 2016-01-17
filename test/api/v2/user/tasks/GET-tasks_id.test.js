import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v2';

describe('GET /user/tasks/:id', () => {
  let user, task;

  beforeEach(async () => {
    user = await generateUser();
    task = user.todos[0];
  });

  it('gets a task', async () => {
    return user.get(`/user/tasks/${task.id}`).then((foundTask) => {
      expect(foundTask.id).to.eql(task.id);
      expect(foundTask.text).to.eql(task.text);
      expect(foundTask.notes).to.eql(task.notes);
      expect(foundTask.value).to.eql(task.value);
      expect(foundTask.type).to.eql(task.type);
    });
  });

  it('returns an error if the task does not exist', async () => {
    return expect(user.get('/user/tasks/task-that-does-not-exist'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        text: t('messageTaskNotFound'),
      });
  });

  it('does not get another user\'s task', async () => {
    return expect(generateUser().then((otherUser) => {
      let otherUsersTask = otherUser.todos[0];

      return user.get(`/user/tasks/${otherUsersTask.id}`);
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      text: t('messageTaskNotFound'),
    });
  });
});
