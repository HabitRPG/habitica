import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

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
      // generate task
      // task = generatedTask;
    });

    it('gets specified task');

    it('can get active challenge task that user does not own'); // Yes?
  });

  context('task cannot accessed', () => {
    it('cannot get a non-existant task');

    it('cannot get a task owned by someone else');
  });
});
