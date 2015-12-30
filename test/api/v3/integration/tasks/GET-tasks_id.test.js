import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('GET /tasks/:id', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  context('task can be accessed', () => {
    let task;

    beforeEach(() => {
      return user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      }).then((createdTask) => {
        task = createdTask;
      });
    });

    it('gets specified task', () => {
      return user.get('/tasks/' + task._id)
      .then((getTask) => {
        expect(getTask).to.eql(task);
      });
    });

    // TODO after challenges are implemented
    it('can get active challenge task that user does not own'); // Yes?
  });

  context('task cannot be accessed', () => {
    it('cannot get a non-existant task', () => {
      return expect(user.get('/tasks/' + generateUUID())).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('cannot get a task owned by someone else', () => {
      let anotherUser;

      return generateUser()
        .then((user2) => {
          anotherUser = user2;

          return user.post('/tasks', {
            text: 'test habit',
            type: 'habit',
          });
        }).then((task) => {
          return expect(anotherUser.get('/tasks/' + task._id)).to.eventually.be.rejected.and.eql({
            code: 404,
            error: 'NotFound',
            message: t('taskNotFound'),
          });
        });
    });
  });
});
