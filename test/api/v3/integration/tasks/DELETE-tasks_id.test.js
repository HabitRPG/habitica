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
      // generate task
      // task = generatedTask;
    });

    it('deletes a user\'s task');
  });

  context('task cannot be deleted', () => {
    it('cannot delete a non-existant task');

    it('cannot delete a task owned by someone else');

    it('cannot delete active challenge tasks');
  });
});
