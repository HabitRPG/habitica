import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('DELETE /tasks/:id', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  context('task can be deleted', () => {
    let task;

    beforeEach(() => {
      return api.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      }).then((createdTask) => {
        task = createdTask;
      });
    });

    it('deletes a user\'s task', () => {
      return api.del('/tasks/' + task._id)
        .then(() => {
          return expect(api.get('/tasks/' + task._id)).to.eventually.be.rejected.and.eql({
            code: 404,
            error: 'NotFound',
            message: t('taskNotFound'),
          });
        });
    });
  });

  context('task cannot be deleted', () => {
    it('cannot delete a non-existant task', () => {
      return expect(api.del('/tasks/550e8400-e29b-41d4-a716-446655440000')).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('cannot delete a task owned by someone else', () => {
      return generateUser()
        .then((user2) => {
          return requester(user2).post('/tasks', {
            text: 'test habit',
            type: 'habit',
          })
        })
        .then((task2) => {
          return expect(api.del('/tasks/' + task2._id)).to.eventually.be.rejected.and.eql({
            code: 404,
            error: 'NotFound',
            message: t('taskNotFound'),
          });
        });
    });

    it('cannot delete active challenge tasks'); // TODO after challenges are implemented
  });
});
