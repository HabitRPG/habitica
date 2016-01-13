import {
  generateUser,
} from '../../../../helpers/api-integration.helper';
import Q from 'q';

describe('GET /tasks', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns all user\'s tasks', async () => {
    let createdTasks = await Q.all([
      user.post('/tasks', {text: 'test habit', type: 'habit'}),
    ]);

    let length = createdTasks.length;
    let tasks = await user.get('/tasks');

    expect(tasks.length).to.equal(length + 1); // + 1 because 1 is a default task
  });

  it('returns only a type of user\'s tasks if req.query.type is specified', async () => {
    let task = await user.post('/tasks', {text: 'test habit', type: 'habit'});
    let tasks = await user.get('/tasks?type=habit');

    expect(tasks.length).to.equal(1);
    expect(tasks[0]._id).to.equal(task._id);
  });

  // TODO complete after task scoring is done
  it('returns completed todos sorted by creation date if req.query.includeCompletedTodos is specified');
});
