import {
  createTasks,
  getTasks,
} from '../../../../../website/server/libs/taskManager';
import i18n from '../../../../../common/script/i18n';
import {
  generateUser,
  generateGroup,
  generateChallenge,
} from '../../../../helpers/api-unit.helper.js';

describe('taskManager', () => {
  let user, group, challenge;
  let testHabit = {
    text: 'test habit',
    type: 'habit',
    up: false,
    down: true,
    notes: 1976,
  };
  let req = {};
  let res = {};

  beforeEach(() => {
    req = {};
    res = {};
    user = generateUser();

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
    });

    challenge = generateChallenge({
      name: 'test challenge',
      shortName: 'testc',
      group: group._id,
      leader: user._id,
    });
  });

  it('creates user tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    let newTasks = await createTasks(req, res, {user});
    let newTask = newTasks[0];

    expect(newTask.text).to.equal(testHabit.text);
    expect(newTask.type).to.equal(testHabit.type);
    expect(newTask.up).to.equal(testHabit.up);
    expect(newTask.down).to.equal(testHabit.down);
    expect(newTask.createdAt).isNotEmtpy;
  });

  it('gets user tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    await createTasks(req, res, {user});

    req.body = {};
    req.query = {
      type: 'habits',
    };

    let tasks = await getTasks(req, res, {user});
    let task = tasks[0];

    expect(task.text).to.equal(testHabit.text);
    expect(task.type).to.equal(testHabit.type);
    expect(task.up).to.equal(testHabit.up);
    expect(task.down).to.equal(testHabit.down);
    expect(task.createdAt).isNotEmtpy;
  });

  it('creates group tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    let newTasks = await createTasks(req, res, {user, group});
    let newTask = newTasks[0];

    expect(newTask.text).to.equal(testHabit.text);
    expect(newTask.type).to.equal(testHabit.type);
    expect(newTask.up).to.equal(testHabit.up);
    expect(newTask.down).to.equal(testHabit.down);
    expect(newTask.createdAt).isNotEmtpy;
    expect(newTask.group.id).to.equal(group._id);
  });

  it('gets group tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    await createTasks(req, res, {user, group});

    req.body = {};
    req.query = {
      type: 'habits',
    };

    let tasks = await getTasks(req, res, {user, group});
    let task = tasks[0];

    expect(task.text).to.equal(testHabit.text);
    expect(task.type).to.equal(testHabit.type);
    expect(task.up).to.equal(testHabit.up);
    expect(task.down).to.equal(testHabit.down);
    expect(task.createdAt).isNotEmtpy;
    expect(task.group.id).to.equal(group._id);
  });

  it('creates challenge tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    let newTasks = await createTasks(req, res, {user, challenge});
    let newTask = newTasks[0];

    expect(newTask.text).to.equal(testHabit.text);
    expect(newTask.type).to.equal(testHabit.type);
    expect(newTask.up).to.equal(testHabit.up);
    expect(newTask.down).to.equal(testHabit.down);
    expect(newTask.createdAt).isNotEmtpy;
    expect(newTask.challenge.id).to.equal(challenge._id);
  });

  it('gets challenge tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    await createTasks(req, res, {user, challenge});

    req.body = {};
    req.query = {
      type: 'habits',
    };

    let tasks = await getTasks(req, res, {user, challenge});
    let task = tasks[0];

    expect(task.text).to.equal(testHabit.text);
    expect(task.type).to.equal(testHabit.type);
    expect(task.up).to.equal(testHabit.up);
    expect(task.down).to.equal(testHabit.down);
    expect(task.createdAt).isNotEmtpy;
    expect(task.challenge.id).to.equal(challenge._id);
  });
});
