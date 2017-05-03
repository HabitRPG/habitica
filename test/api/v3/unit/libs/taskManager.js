import moment from 'moment';
import nconf from 'nconf';
import requireAgain from 'require-again'; // @TODO: Remove the need for this. Stub a singelton

import {
  ageDailies,
  createTasks,
  getTasks,
  syncableAttrs,
  moveTask,
} from '../../../../../website/server/libs/taskManager';
import i18n from '../../../../../website/common/script/i18n';
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
      leader: user._id,
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

  it('returns syncable attibutes', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    let tasks = await createTasks(req, res, {user, challenge});

    let syncableTask = syncableAttrs(tasks[0]);

    expect(syncableTask._id).to.not.exist;
    expect(syncableTask.userId).to.not.exist;
    expect(syncableTask.challenge).to.not.exist;
    expect(syncableTask.history).to.not.exist;
    expect(syncableTask.tags).to.not.exist;
    expect(syncableTask.completed).to.not.exist;
    expect(syncableTask.streak).to.not.exist;
    expect(syncableTask.notes).to.not.exist;
    expect(syncableTask.updatedAt).to.not.exist;
  });

  it('moves tasks to a specified position', async() => {
    let order = ['task-id-1', 'task-id-2'];

    moveTask(order, 'task-id-2', 0);

    expect(order).to.eql(['task-id-2', 'task-id-1']);
  });

  describe('aging dailies', async () => {
    let dailies, daysMissed;

    beforeEach(async () => {
      let daily = {
        text: 'test daily',
        type: 'daily',
      };
      req.body = daily;
      res.t = i18n.t;
      dailies = await createTasks(req, res, {user});

      daysMissed = 1;

      user._statsComputed = {
        con: 1,
      };
    });

    it('should do damage for missing a daily', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      dailies[0].startDate = moment(new Date()).subtract({days: 1});

      ageDailies(user, daysMissed, dailies);

      expect(user.stats.hp).to.be.lessThan(hpBefore);
    });

    it('should not do damage for missing a daily when CRON_SAFE_MODE is set', () => {
      sandbox.stub(nconf, 'get').withArgs('CRON_SAFE_MODE').returns('true');
      let ageDailiesOverride = requireAgain('../../../../../website/server/libs/taskManager').ageDailies;

      daysMissed = 1;
      let hpBefore = user.stats.hp;
      dailies[0].startDate = moment(new Date()).subtract({days: 1});

      ageDailiesOverride(user, daysMissed, dailies);

      expect(user.stats.hp).to.equal(hpBefore);
    });

    it('should not do damage for missing a daily if user stealth buff is greater than or equal to days missed', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      user.stats.buffs.stealth = 2;
      dailies[0].startDate = moment(new Date()).subtract({days: 1});

      ageDailies(user, daysMissed, dailies);

      expect(user.stats.hp).to.equal(hpBefore);
    });

    it('should do less damage for missing a daily with partial completion', () => {
      daysMissed = 1;
      let hpBefore = user.stats.hp;
      dailies[0].startDate = moment(new Date()).subtract({days: 1});
      ageDailies(user, daysMissed, dailies);
      let hpDifferenceOfFullyIncompleteDaily = hpBefore - user.stats.hp;

      hpBefore = user.stats.hp;
      dailies[0].checklist.push({title: 'test', completed: true});
      dailies[0].checklist.push({title: 'test2', completed: false});
      ageDailies(user, daysMissed, dailies);
      let hpDifferenceOfPartiallyIncompleteDaily = hpBefore - user.stats.hp;

      expect(hpDifferenceOfPartiallyIncompleteDaily).to.be.lessThan(hpDifferenceOfFullyIncompleteDaily);
    });

    it('should decrement quest progress down for missing a daily', () => {
      daysMissed = 1;
      dailies[0].startDate = moment(new Date()).subtract({days: 1});

      ageDailies(user, daysMissed, dailies);

      expect(user.party.quest.progress.down).to.equal(-1);
    });
  });
});
