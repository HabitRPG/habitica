import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v2';

describe('POST /user/tasks', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('creates a task', async () => {
    return user.post('/user/tasks').then((task) => {
      expect(task.id).to.exist;
    });
  });

  it('creates a habit by default', async () => {
    return expect(user.post('/user/tasks'))
      .to.eventually.have.property('type', 'habit');
  });

  it('creates a task with specified values', async () => {
    return user.post('/user/tasks', {
      type: 'daily',
      text: 'My task',
      notes: 'My notes',
      frequency: 'daily',
    }).then((task) => {
      expect(task.type).to.eql('daily');
      expect(task.text).to.eql('My task');
      expect(task.notes).to.eql('My notes');
      expect(task.frequency).to.eql('daily');
    });
  });

  it('does not create a task with an id that already exists', async () => {
    let todo = user.todos[0];

    return expect(user.post('/user/tasks', {
      id: todo.id,
    })).to.eventually.be.rejected.and.eql({
      code: 409,
      text: t('messageDuplicateTaskID'),
    });
  });

  xit('TODO: no error is thrown - throws a 500 validation error if invalid type is posted', async () => {
    return expect(user.post('/user/tasks', {
      type: 'not-valid',
    })).to.eventually.be.rejected.and.eql({
      code: 500,
      text: 'Cannot call method \'indexOf\' of undefined',
    });
  });

  xit('TODO: no error is thrown - throws a 500 validation error if invalid data is posted', async () => {
    return expect(user.post('/user/tasks', {
      frequency: 'not-valid',
    })).to.eventually.be.rejected.and.eql({
      code: 500,
      text: 'Task validation failed',
    });
  });
});
