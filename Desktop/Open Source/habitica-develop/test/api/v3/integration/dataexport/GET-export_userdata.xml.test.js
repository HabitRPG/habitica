import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';
import xml2js from 'xml2js';
import Bluebird from 'bluebird';

let parseStringAsync = Bluebird.promisify(xml2js.parseString, {context: xml2js});

describe('GET /export/userdata.xml', () => {
  // TODO disabled because it randomly causes the build to fail
  xit('should return a valid XML file with user data', async () => {
    let user = await generateUser();
    let tasks = await user.post('/tasks/user', [
      {type: 'habit', text: 'habit 1'},
      {type: 'daily', text: 'daily 1'},
      {type: 'reward', text: 'reward 1'},
      {type: 'todo', text: 'todo 1'},
      // due to how the xml parser works an array is returned only if there's more than one children
      // so we create two tasks for each type
      {type: 'habit', text: 'habit 2'},
      {type: 'daily', text: 'daily 2'},
      {type: 'reward', text: 'reward 2'},
      {type: 'todo', text: 'todo 2'},

    ]);

    let response = await user.get('/export/userdata.xml');
    let {user: res} = await parseStringAsync(response, {explicitArray: false});

    expect(res._id).to.equal(user._id);
    expect(res).to.contain.all.keys(['tasks', 'flags', 'tasksOrder', 'auth']);
    expect(res.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(res.tasks).to.have.all.keys(['dailys', 'habits', 'todos', 'rewards']);
    expect(res.tasks.habits.length).to.equal(2);
    expect(res.tasks.habits[0]._id).to.equal(tasks[0]._id);
    expect(res.tasks.dailys.length).to.equal(2);
    expect(res.tasks.dailys[0]._id).to.equal(tasks[1]._id);
    expect(res.tasks.rewards.length).to.equal(2);
    expect(res.tasks.rewards[0]._id).to.equal(tasks[2]._id);
    expect(res.tasks.todos.length).to.equal(3);
    expect(res.tasks.todos[1]._id).to.equal(tasks[3]._id);
  });
});
