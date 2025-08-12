import xml2js from 'xml2js';
import util from 'util';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

const parseStringAsync = util.promisify(xml2js.parseString).bind(xml2js);

describe('GET /export/userdata.xml', () => {
  it('should return a valid XML file with user data', async () => {
    const user = await generateUser();
    const tasks = await user.post('/tasks/user', [
      { type: 'habit', text: 'habit 1' },
      { type: 'daily', text: 'daily 1' },
      { type: 'reward', text: 'reward 1' },
      { type: 'todo', text: 'todo 1' },
      // due to how the xml parser works an array is returned only if there's more than one children
      // so we create two tasks for each type
      { type: 'habit', text: 'habit 2' },
      { type: 'daily', text: 'daily 2' },
      { type: 'reward', text: 'reward 2' },
      { type: 'todo', text: 'todo 2' },

    ]);

    // add pinnedItem
    await user.get('/user/toggle-pinned-item/marketGear/gear.flat.shield_rogue_5');

    // add a private message
    const receiver = await generateUser();

    user.post('/members/send-private-message', {
      message: 'Your first message, hi!',
      toUserId: receiver._id,
    });

    const response = await user.get('/export/userdata.xml');
    const { user: res } = await parseStringAsync(response, { explicitArray: false });

    expect(res._id).to.equal(user._id);
    expect(res).to.contain.all.keys(['tasks', 'flags', 'tasksOrder', 'auth']);
    expect(res.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(res.tasks).to.have.all.keys(['dailys', 'habits', 'todos', 'rewards']);

    expect(res.tasks.habits.length).to.equal(2);
    const habitIds = _.map(res.tasks.habits, '_id');
    expect(habitIds).to.have.deep.members([tasks[0]._id, tasks[4]._id]);

    expect(res.tasks.dailys.length).to.equal(2);
    const dailyIds = _.map(res.tasks.dailys, '_id');
    expect(dailyIds).to.have.deep.members([tasks[1]._id, tasks[5]._id]);

    expect(res.tasks.rewards.length).to.equal(2);
    const rewardIds = _.map(res.tasks.rewards, '_id');
    expect(rewardIds).to.have.deep.members([tasks[2]._id, tasks[6]._id]);

    expect(res.tasks.todos.length).to.equal(3);
    const todoIds = _.map(res.tasks.todos, '_id');
    expect(todoIds).to.deep.include.members([tasks[3]._id, tasks[7]._id]);
  });
});
