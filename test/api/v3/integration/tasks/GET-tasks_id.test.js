import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('GET /tasks/:id', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  context('task can be accessed', () => {
    let task;

    beforeEach(() => {
      return api.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      }).then((createdTask) => {
        task = createdTask;
      });
    });

    it('gets specified task', () => {
      return api.get('/tasks/' + task._id)
      .then((getTask) => {
        expect(getTask).to.eql(task);
      });
    });

    // TODO after challenges are implemented
    it('can get active challenge task that user does not own'); // Yes?
  });

  context('task cannot accessed', () => {
    it('cannot get a non-existant task', () => {
      return expect(api.get('/tasks/' + generateUUID())).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('cannot get a task owned by someone else', () => {
      let api2;

      return generateUser()
        .then((user2) => {
          api2 = requester(user2);
          return api.post('/tasks', {
            text: 'test habit',
            type: 'habit',
          })
        }).then((task) => {
          return expect(api2.get('/tasks/' + task._id)).to.eventually.be.rejected.and.eql({
            code: 404,
            error: 'NotFound',
            message: t('taskNotFound'),
          });
        });
    });
  });
});
