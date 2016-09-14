import { model as Challenge } from '../../../../../website/server/models/challenge';
import { model as Group } from '../../../../../website/server/models/group';
import { model as User } from '../../../../../website/server/models/user';
import * as Tasks from '../../../../../website/server/models/task';
import common from '../../../../../website/common/';
import { each, find } from 'lodash';

describe('Challenge Model', () => {
  let guild, leader, challenge, task, tasksToTest;

  beforeEach(async () => {
    tasksToTest = {
      habit: {
        text: 'test habit',
        type: 'habit',
        up: false,
        down: true,
      },
      todo: {
        text: 'test todo',
        type: 'todo',
      },
      daily: {
        text: 'test daily',
        type: 'daily',
        frequency: 'daily',
        everyX: 5,
        startDate: new Date(),
      },
      reward: {
        text: 'test reward',
        type: 'reward',
      },
    };
    guild = new Group({
      name: 'test party',
      type: 'guild',
    });

    leader = new User({
      guilds: [guild._id],
    });

    guild.leader = leader._id;

    challenge = new Challenge({
      name: 'Test Challenge',
      shortName: 'Test',
      leader: leader._id,
      group: guild._id,
    });

    leader.challenges = [challenge._id];

    await Promise.all([
      guild.save(),
      leader.save(),
      challenge.save(),
    ]);
  });

  each(tasksToTest, (taskValue, taskType) => {
    context(`${taskType}`, () => {
      beforeEach(async() => {
        task = new Tasks[`${taskType}`](Tasks.Task.sanitize(taskValue));
        task.challenge.id = challenge._id;
        await task.save();
      });

      it('adds tasks to challenge and challenge members', async () => {
        await challenge.addTasks([task]);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, function findNewTask (updatedLeadersTask) {
          return updatedLeadersTask.type === taskValue.type && updatedLeadersTask.text === taskValue.text;
        });

        expect(syncedTask).to.exist;
      });

      it('syncs a challenge to a user', async () => {
        await challenge.addTasks([task]);

        let newMember = new User({
          guilds: [guild._id],
        });
        await newMember.save();

        await challenge.syncToUser(newMember);

        let updatedNewMember = await User.findById(newMember._id);
        let updatedNewMemberTasks = await Tasks.Task.find({_id: { $in: updatedNewMember.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedNewMemberTasks, function findNewTask (updatedNewMemberTask) {
          return updatedNewMemberTask.type === taskValue.type && updatedNewMemberTask.text === taskValue.text;
        });

        expect(updatedNewMember.challenges).to.contain(challenge._id);
        expect(updatedNewMember.tags[3].id).to.equal(challenge._id);
        expect(updatedNewMember.tags[3].name).to.equal(challenge.shortName);
        expect(syncedTask).to.exist;
      });

      it('updates tasks to challenge and challenge members', async () => {
        let updatedTaskName = 'Updated Test Habit';
        await challenge.addTasks([task]);

        let req = {
          body: { text: updatedTaskName },
        };

        Tasks.Task.sanitize(req.body);
        _.assign(task, common.ops.updateTask(task.toObject(), req)[0]);

        await challenge.updateTask(task);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder[`${taskType}s`][0]);

        expect(updatedUserTask.text).to.equal(updatedTaskName);
      });

      it('removes a tasks to challenge and challenge members', async () => {
        await challenge.addTasks([task]);
        await challenge.removeTask(task);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedUserTask = await Tasks.Task.findOne({_id: updatedLeader.tasksOrder[`${taskType}s`][0]}).exec();

        expect(updatedUserTask.challenge.broken).to.equal('TASK_DELETED');
      });

      it('unlinks and deletes challenge tasks for a user when remove-all is specified', async () => {
        await challenge.addTasks([task]);
        await challenge.unlinkTasks(leader, 'remove-all');

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, function findNewTask (updatedLeadersTask) {
          return updatedLeadersTask.type === taskValue.type && updatedLeadersTask.text === taskValue.text;
        });

        expect(syncedTask).to.not.exist;
      });

      it('unlinks and keeps challenge tasks for a user when keep-all is specified', async () => {
        await challenge.addTasks([task]);
        await challenge.unlinkTasks(leader, 'keep-all');

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, function findNewTask (updatedLeadersTask) {
          return updatedLeadersTask.type === taskValue.type && updatedLeadersTask.text === taskValue.text;
        });

        expect(syncedTask).to.exist;
        expect(syncedTask.challenge._id).to.be.empty;
      });
    });
  });

  context('type specific updates', () => {
    it('updates habit specific field to challenge and challenge members', async () => {
      task = new Tasks.habit(Tasks.Task.sanitize(tasksToTest.habit)); // eslint-disable-line babel/new-cap
      task.challenge.id = challenge._id;
      await task.save();

      await challenge.addTasks([task]);

      task.up = true;
      task.down = false;

      await challenge.updateTask(task);

      let updatedLeader = await User.findOne({_id: leader._id});
      let updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder.habits[0]);

      expect(updatedUserTask.up).to.equal(true);
      expect(updatedUserTask.down).to.equal(false);
    });

    it('updates todo specific field to challenge and challenge members', async () => {
      task = new Tasks.todo(Tasks.Task.sanitize(tasksToTest.todo)); // eslint-disable-line babel/new-cap
      task.challenge.id = challenge._id;
      await task.save();

      await challenge.addTasks([task]);

      task.date = new Date();
      await challenge.updateTask(task);

      let updatedLeader = await User.findOne({_id: leader._id});
      let updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder.todos[0]);

      expect(updatedUserTask.date).to.exist;
    });

    it('does not update checklists on the user task', async () => {
      task = new Tasks.todo(Tasks.Task.sanitize(tasksToTest.todo)); // eslint-disable-line babel/new-cap
      task.challenge.id = challenge._id;
      await task.save();

      await challenge.addTasks([task]);

      task.checklist.push({
        text: 'a new checklist',
      });
      await challenge.updateTask(task);

      let updatedLeader = await User.findOne({_id: leader._id});
      let updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder.todos[0]);

      expect(updatedUserTask.checklist.toObject()).to.deep.equal([]);
    });

    it('updates daily specific field to challenge and challenge members', async () => {
      task = new Tasks.daily(Tasks.Task.sanitize(tasksToTest.daily)); // eslint-disable-line babel/new-cap
      task.challenge.id = challenge._id;
      await task.save();

      await challenge.addTasks([task]);

      task.everyX = 2;
      await challenge.updateTask(task);

      let updatedLeader = await User.findOne({_id: leader._id});
      let updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder.dailys[0]);

      expect(updatedUserTask.everyX).to.eql(2);
    });
  });
});
