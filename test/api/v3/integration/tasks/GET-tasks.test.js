import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import Q from 'q';

describe('GET /tasks', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('returns all user\'s tasks', () => {
    let length;
    return Q.all([
      api.post('/tasks', {text: 'test habit', type: 'habit'}),
    ])
    .then((createdTasks) => {
      length = createdTasks.length;
      return api.get('/tasks');
    })
    .then((tasks) => {
      expect(tasks.length).to.equal(length + 1); // + 1 because 1 is a default task
    });
  });

  it('returns only a type of user\'s tasks if req.query.type is specified', () => {
    let habitId;
    api.post('/tasks', {text: 'test habit', type: 'habit'})
    .then((task) => {
      habitId = task._id;
      return api.get('/tasks?type=habit');
    })
    .then((tasks) => {
      expect(tasks.length).to.equal(1);
      expect(tasks[0]._id).to.equal(habitId);
    });
  });

  // TODO complete after task scoring is done
  it('returns completed todos sorted by creation date if req.query.includeCompletedTodos is specified')
});
