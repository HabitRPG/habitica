import {
  createTasks,
  getTasks,
} from '../../../../website/server/libs/tasks';
import {
  syncableAttrs,
  moveTask,
} from '../../../../website/server/libs/tasks/utils';
import i18n from '../../../../website/common/script/i18n';
import shared from '../../../../website/common/script';
import {
  generateUser,
  generateGroup,
  generateChallenge,
} from '../../../helpers/api-unit.helper';

describe('taskManager', () => {
  let user; let group; let
    challenge;
  const testHabit = {
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

    const newTasks = await createTasks(req, res, { user });
    const newTask = newTasks[0];

    expect(newTask.text).to.equal(testHabit.text);
    expect(newTask.type).to.equal(testHabit.type);
    expect(newTask.up).to.equal(testHabit.up);
    expect(newTask.down).to.equal(testHabit.down);
    expect(newTask.createdAt).to.exist;
  });

  describe('onboarding', () => {
    beforeEach(() => {
      user.addAchievement = sinon.spy();
      sinon.stub(shared.onboarding, 'checkOnboardingStatus');
    });

    afterEach(() => {
      shared.onboarding.checkOnboardingStatus.restore();
    });

    it('adds the onboarding achievement to the user and checks the onboarding status', async () => {
      req.body = testHabit;
      res.t = i18n.t;
      user.flags.welcomed = true;

      await createTasks(req, res, { user });

      expect(user.addAchievement).to.be.calledOnce;
      expect(user.addAchievement).to.be.calledWith('createdTask');

      expect(shared.onboarding.checkOnboardingStatus).to.be.calledOnce;
      expect(shared.onboarding.checkOnboardingStatus).to.be.calledWith(user);
    });

    it('does not add the onboarding achievement to the user if flags.welcomed is false', async () => {
      req.body = testHabit;
      res.t = i18n.t;
      user.flags.welcomed = false;

      await createTasks(req, res, { user });

      expect(user.addAchievement).to.not.be.called;
    });

    it('does not add the onboarding achievement to the user if it\'s already been awarded', async () => {
      req.body = testHabit;
      res.t = i18n.t;
      user.achievements.createdTask = true;

      await createTasks(req, res, { user });

      expect(user.addAchievement).to.not.be.called;
    });
  });

  it('gets user tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    await createTasks(req, res, { user });

    req.body = {};
    req.query = {
      type: 'habits',
    };

    const tasks = await getTasks(req, res, { user });
    const task = tasks[0];

    expect(task.text).to.equal(testHabit.text);
    expect(task.type).to.equal(testHabit.type);
    expect(task.up).to.equal(testHabit.up);
    expect(task.down).to.equal(testHabit.down);
    expect(task.createdAt).to.exist;
  });

  it('creates group tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    const newTasks = await createTasks(req, res, { user, group });
    const newTask = newTasks[0];

    expect(newTask.text).to.equal(testHabit.text);
    expect(newTask.type).to.equal(testHabit.type);
    expect(newTask.up).to.equal(testHabit.up);
    expect(newTask.down).to.equal(testHabit.down);
    expect(newTask.createdAt).to.exist;
    expect(newTask.group.id).to.equal(group._id);
  });

  it('gets group tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    await createTasks(req, res, { user, group });

    req.body = {};
    req.query = {
      type: 'habits',
    };

    const tasks = await getTasks(req, res, { user, group });
    const task = tasks[0];

    expect(task.text).to.equal(testHabit.text);
    expect(task.type).to.equal(testHabit.type);
    expect(task.up).to.equal(testHabit.up);
    expect(task.down).to.equal(testHabit.down);
    expect(task.createdAt).to.exist;
    expect(task.group.id).to.equal(group._id);
  });

  it('creates challenge tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    const newTasks = await createTasks(req, res, { user, challenge });
    const newTask = newTasks[0];

    expect(newTask.text).to.equal(testHabit.text);
    expect(newTask.type).to.equal(testHabit.type);
    expect(newTask.up).to.equal(testHabit.up);
    expect(newTask.down).to.equal(testHabit.down);
    expect(newTask.createdAt).to.exist;
    expect(newTask.challenge.id).to.equal(challenge._id);
  });

  it('gets challenge tasks', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    await createTasks(req, res, { user, challenge });

    req.body = {};
    req.query = {
      type: 'habits',
    };

    const tasks = await getTasks(req, res, { user, challenge });
    const task = tasks[0];

    expect(task.text).to.equal(testHabit.text);
    expect(task.type).to.equal(testHabit.type);
    expect(task.up).to.equal(testHabit.up);
    expect(task.down).to.equal(testHabit.down);
    expect(task.createdAt).to.exist;
    expect(task.challenge.id).to.equal(challenge._id);
  });

  it('returns syncable attibutes', async () => {
    req.body = testHabit;
    res.t = i18n.t;

    const tasks = await createTasks(req, res, { user, challenge });

    const syncableTask = syncableAttrs(tasks[0]);

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

  it('moves tasks to a specified position', async () => {
    const order = ['task-id-1', 'task-id-2'];

    moveTask(order, 'task-id-2', 0);

    expect(order).to.eql(['task-id-2', 'task-id-1']);
  });

  it('moves tasks to a specified position out of length', async () => {
    const order = ['task-id-1'];

    moveTask(order, 'task-id-2', 2);

    expect(order).to.eql(['task-id-1', 'task-id-2']);
  });
});
