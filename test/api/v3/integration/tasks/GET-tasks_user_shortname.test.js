import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /tasks/user/:shortName', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns the task from the short name', async () => {
    let createdTask = await user.post('/tasks/user', {text: 'test todo', type: 'todo', shortName: 'short-text'});
    let taskByName = await user.get('/tasks/user/short-text');
    let taskById = await user.get(`/tasks/${createdTask._id}`);

    expect(taskByName.type).to.equal('todo');
    expect(taskByName.text).to.equal('test todo');
    expect(taskByName.shortName).to.equal('short-text');

    expect(taskById).to.eql(taskByName);
  });
});
