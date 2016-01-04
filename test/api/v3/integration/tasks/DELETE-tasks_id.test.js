import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('DELETE /tasks/:id', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  context('task can be deleted', () => {
    let task;

    beforeEach(() => {
      return user.post('/tasks?tasksOwner=user', {
        text: 'test habit',
        type: 'habit',
      }).then((createdTask) => {
        task = createdTask;
      });
    });

    it('deletes a user\'s task', () => {
      return user.del(`/tasks/${task._id}`)
        .then(() => {
          return expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
            code: 404,
            error: 'NotFound',
            message: t('taskNotFound'),
          });
        });
    });
  });

  context('task cannot be deleted', () => {
    it('cannot delete a non-existant task', () => {
      return expect(user.del('/tasks/550e8400-e29b-41d4-a716-446655440000')).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('cannot delete a task owned by someone else', () => {
      return generateUser()
        .then((anotherUser) => {
          return anotherUser.post('/tasks?tasksOwner=user', {
            text: 'test habit',
            type: 'habit',
          });
        })
        .then((task2) => {
          return expect(user.del(`/tasks/${task2._id}`)).to.eventually.be.rejected.and.eql({
            code: 404,
            error: 'NotFound',
            message: t('taskNotFound'),
          });
        });
    });

    it('cannot delete active challenge tasks'); // TODO after challenges are implemented
    it('remove a task from user.tasksOrder'); // TODO
  });
});
