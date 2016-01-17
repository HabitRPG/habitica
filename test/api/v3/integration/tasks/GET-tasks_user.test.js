import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /tasks/user', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns all user\'s tasks', async () => {
    let createdTasks = await user.post('/tasks/user', [{text: 'test habit', type: 'habit'}, {text: 'test todo', type: 'todo'}]);
    let tasks = await user.get('/tasks/user');
    expect(tasks.length).to.equal(createdTasks.length + 1); // + 1 because 1 is a default task
  });

  it('returns only a type of user\'s tasks if req.query.type is specified', async () => {
    let createdTasks = await user.post('/tasks/user', [{text: 'test habit', type: 'habit'}, {text: 'test todo', type: 'todo'}]);
    let tasks = await user.get('/tasks/user?type=habit');
    expect(tasks.length).to.equal(1);
    expect(tasks[0]._id).to.equal(createdTasks[0]._id);
  });

  // TODO complete after task scoring is done
  it('returns completed todos sorted by creation date if req.query.includeCompletedTodos is specified');
});
