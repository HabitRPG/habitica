import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';
import xml2js from 'xml2js';
import Bluebird from 'bluebird';

let parseStringAsync = Bluebird.promisify(xml2js.parseString, {context: xml2js});

describe('GET /export/userdata.xml', () => {
  it('should return a valid XML file with user data', async () => {
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
    let habitIds = _.map(res.tasks.habits, '_id');
    expect(habitIds).to.have.deep.members([tasks[0]._id, tasks[4]._id]);

    expect(res.tasks.dailys.length).to.equal(2);
    let dailyIds = _.map(res.tasks.dailys, '_id');
    expect(dailyIds).to.have.deep.members([tasks[1]._id, tasks[5]._id]);

    expect(res.tasks.rewards.length).to.equal(2);
    let rewardIds = _.map(res.tasks.rewards, '_id');
    expect(rewardIds).to.have.deep.members([tasks[2]._id, tasks[6]._id]);

    expect(res.tasks.todos.length).to.equal(3);
    let todoIds = _.map(res.tasks.todos, '_id');
    expect(todoIds).to.deep.include.members([tasks[3]._id, tasks[7]._id]);
  });
});
