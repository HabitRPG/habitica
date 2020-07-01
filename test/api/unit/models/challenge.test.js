import { each, find } from 'lodash';
import { model as Challenge } from '../../../../website/server/models/challenge';
import { model as Group } from '../../../../website/server/models/group';
import { model as User } from '../../../../website/server/models/user';
import * as Tasks from '../../../../website/server/models/task';
import common from '../../../../website/common';

describe('Challenge Model', () => {
  let guild; let leader; let challenge; let
    task;
  const tasksToTest = {
    habit: {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 'test notes',
    },
    todo: {
      text: 'test todo',
      type: 'todo',
      notes: 'test notes',
    },
    daily: {
      text: 'test daily',
      type: 'daily',
      frequency: 'daily',
      everyX: 5,
      startDate: new Date(),
      notes: 'test notes',
    },
    reward: {
      text: 'test reward',
      type: 'reward',
      notes: 'test notes',
    },
  };
  const tasks2ToTest = {
    habit: {
      text: 'test habit 2',
      type: 'habit',
      up: false,
      down: true,
      notes: 'test notes',
    },
    todo: {
      text: 'test todo 2',
      type: 'todo',
      notes: 'test notes',
    },
    daily: {
      text: 'test daily 2',
      type: 'daily',
      frequency: 'daily',
      everyX: 5,
      startDate: new Date(),
      notes: 'test notes',
    },
    reward: {
      text: 'test reward 2',
      type: 'reward',
      notes: 'test notes',
    },
  };

  beforeEach(async () => {
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
      beforeEach(async () => {
        task = new Tasks[`${taskType}`](Tasks.Task.sanitize(taskValue));
        task.challenge.id = challenge._id;
        await task.save();
      });

      it('adds tasks to challenge and challenge members', async () => {
        await challenge.addTasks([task]);

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        const syncedTask = find(
          updatedLeadersTasks,
          updatedLeadersTask => (
            updatedLeadersTask.type === taskValue.type
            && updatedLeadersTask.text === taskValue.text
          ),
        );

        expect(syncedTask).to.exist;
        expect(syncedTask.notes).to.eql(task.notes);
        expect(syncedTask.tags[0]).to.eql(challenge._id);
      });

      it('adds a challenge to a user', async () => {
        const newMember = new User({
          guilds: [guild._id],
        });
        await newMember.save();

        const addedSuccessfully = await challenge.addToUser(newMember);

        const updatedNewMember = await User.findById(newMember._id);

        expect(addedSuccessfully).to.eql(true);
        expect(updatedNewMember.challenges).to.contain(challenge._id);
      });

      it('does not add a challenge to a user that already in the challenge', async () => {
        const newMember = new User({
          guilds: [guild._id],
          challenges: [challenge._id],
        });
        await newMember.save();

        const addedSuccessfully = await challenge.addToUser(newMember);

        const updatedNewMember = await User.findById(newMember._id);

        expect(addedSuccessfully).to.eql(false);
        expect(updatedNewMember.challenges).to.contain(challenge._id);
        expect(updatedNewMember.challenges.length).to.eql(1);
      });

      it('syncs challenge tasks to a user', async () => {
        await challenge.addTasks([task]);

        const newMember = new User({
          guilds: [guild._id],
        });
        await newMember.save();

        await challenge.syncTasksToUser(newMember);

        const updatedNewMember = await User.findById(newMember._id);
        const updatedNewMemberTasks = await Tasks.Task.find({ _id: { $in: updatedNewMember.tasksOrder[`${taskType}s`] } });
        const syncedTask = find(
          updatedNewMemberTasks,
          updatedNewMemberTask => (
            updatedNewMemberTask.type === taskValue.type
            && updatedNewMemberTask.text === taskValue.text
          ),
        );

        expect(updatedNewMember.tags[7].id).to.equal(challenge._id);
        expect(updatedNewMember.tags[7].name).to.equal(challenge.shortName);
        expect(syncedTask).to.exist;
        expect(syncedTask.attribute).to.eql('str');
      });

      it('should add challenge tag back to user upon syncing challenge tasks to a user with challenge tag removed', async () => {
        await challenge.addTasks([task]);

        const newMember = new User({
          guilds: [guild._id],
        });
        await newMember.save();
        await challenge.syncTasksToUser(newMember);

        let updatedNewMember = await User.findById(newMember._id).exec();
        const updatedNewMemberId = updatedNewMember._id;

        updatedNewMember.tags = [];
        await updatedNewMember.save();

        const taskValue2 = tasks2ToTest[taskType];
        const task2 = new Tasks[`${taskType}`](Tasks.Task.sanitize(taskValue2));
        task2.challenge.id = challenge._id;
        await challenge.addTasks([task2]);
        await challenge.syncTasksToUser(updatedNewMember);

        updatedNewMember = await User.findById(updatedNewMemberId).exec();

        expect(updatedNewMember.tags.length).to.equal(1);
        expect(updatedNewMember.tags[0].id).to.equal(challenge._id);
        expect(updatedNewMember.tags[0].name).to.equal(challenge.shortName);
      });

      it('should not add a duplicate challenge tag to user upon syncing challenge tasks to a user with existing challenge tag', async () => {
        await challenge.addTasks([task]);

        const newMember = new User({
          guilds: [guild._id],
        });
        await newMember.save();
        await challenge.syncTasksToUser(newMember);

        let updatedNewMember = await User.findById(newMember._id).exec();
        const updatedNewMemberId = updatedNewMember._id;

        const taskValue2 = tasks2ToTest[taskType];
        const task2 = new Tasks[`${taskType}`](Tasks.Task.sanitize(taskValue2));
        task2.challenge.id = challenge._id;
        await challenge.addTasks([task2]);
        await challenge.syncTasksToUser(updatedNewMember);

        updatedNewMember = await User.findById(updatedNewMemberId);

        expect(updatedNewMember.tags.length).to.equal(8);
        expect(updatedNewMember.tags[7].id).to.equal(challenge._id);
        expect(updatedNewMember.tags[7].name).to.equal(challenge.shortName);
        expect(updatedNewMember.tags.filter(tag => tag.id === challenge._id).length).to.equal(1);
      });

      it('syncs challenge tasks to a user with the existing task', async () => {
        await challenge.addTasks([task]);

        let updatedLeader = await User.findOne({ _id: leader._id });
        let updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        let syncedTask = find(
          updatedLeadersTasks,
          updatedLeadersTask => updatedLeadersTask.challenge.taskId === task._id,
        );

        const createdAtBefore = syncedTask.createdAt;
        const attributeBefore = syncedTask.attribute;

        const newTitle = 'newName';
        task.text = newTitle;
        task.attribute = 'int';
        await task.save();
        await challenge.syncTasksToUser(leader);

        updatedLeader = await User.findOne({ _id: leader._id });
        updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });

        syncedTask = find(
          updatedLeadersTasks,
          updatedLeadersTask => updatedLeadersTask.challenge.taskId === task._id,
        );

        const createdAtAfter = syncedTask.createdAt;
        const attributeAfter = syncedTask.attribute;

        expect(createdAtBefore).to.eql(createdAtAfter);
        expect(attributeBefore).to.eql(attributeAfter);
        expect(syncedTask.text).to.eql(newTitle);
      });

      it('updates tasks to challenge and challenge members', async () => {
        const updatedTaskName = 'Updated Test Habit';
        await challenge.addTasks([task]);

        const req = {
          body: { text: updatedTaskName },
        };

        Tasks.Task.sanitize(req.body);
        _.assign(task, common.ops.updateTask(task.toObject(), req)[0]);

        await challenge.updateTask(task);

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder[`${taskType}s`][0]);

        expect(updatedUserTask.text).to.equal(updatedTaskName);
      });

      it('removes a tasks to challenge and challenge members', async () => {
        await challenge.addTasks([task]);
        await challenge.removeTask(task);

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedUserTask = await Tasks.Task.findOne({ _id: updatedLeader.tasksOrder[`${taskType}s`][0] }).exec();

        expect(updatedUserTask.challenge.broken).to.equal('TASK_DELETED');
      });

      it('unlinks and deletes challenge tasks for a user when remove-all is specified', async () => {
        await challenge.addTasks([task]);
        await challenge.unlinkTasks(leader, 'remove-all');

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        const syncedTask = find(
          updatedLeadersTasks,
          updatedLeadersTask => (
            updatedLeadersTask.type === taskValue.type
            && updatedLeadersTask.text === taskValue.text
          ),
        );

        expect(syncedTask).to.not.exist;
      });

      it('unlinks and keeps challenge tasks for a user when keep-all is specified', async () => {
        await challenge.addTasks([task]);
        await challenge.unlinkTasks(leader, 'keep-all');

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        const syncedTask = find(
          updatedLeadersTasks,
          updatedLeadersTask => (
            updatedLeadersTask.type === taskValue.type
            && updatedLeadersTask.text === taskValue.text
          ),
        );

        expect(syncedTask).to.exist;
        expect(syncedTask.challenge._id).to.be.undefined;
      });
    });
  });

  context('type specific updates', () => {
    it('updates habit specific field to challenge and challenge members', async () => {
      task = new Tasks.habit(Tasks.Task.sanitize(tasksToTest.habit)); // eslint-disable-line new-cap
      task.challenge.id = challenge._id;
      await task.save();

      await challenge.addTasks([task]);

      task.up = true;
      task.down = false;

      await challenge.updateTask(task);

      const updatedLeader = await User.findOne({ _id: leader._id });
      const updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder.habits[0]);

      expect(updatedUserTask.up).to.equal(true);
      expect(updatedUserTask.down).to.equal(false);
    });

    it('updates todo specific field to challenge and challenge members', async () => {
      task = new Tasks.todo(Tasks.Task.sanitize(tasksToTest.todo)); // eslint-disable-line new-cap
      task.challenge.id = challenge._id;
      await task.save();

      await challenge.addTasks([task]);

      task.date = new Date();
      await challenge.updateTask(task);

      const updatedLeader = await User.findOne({ _id: leader._id });
      const updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder.todos[0]);

      expect(updatedUserTask.date).to.exist;
    });

    it('does not update checklists on the user task', async () => {
      task = new Tasks.todo(Tasks.Task.sanitize(tasksToTest.todo)); // eslint-disable-line new-cap
      task.challenge.id = challenge._id;
      await task.save();

      await challenge.addTasks([task]);

      task.checklist.push({
        text: 'a new checklist',
      });
      await challenge.updateTask(task);

      const updatedLeader = await User.findOne({ _id: leader._id });
      const updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder.todos[0]);

      expect(updatedUserTask.checklist.toObject()).to.deep.equal([]);
    });

    it('updates daily specific field to challenge and challenge members', async () => {
      task = new Tasks.daily(Tasks.Task.sanitize(tasksToTest.daily)); // eslint-disable-line new-cap
      task.challenge.id = challenge._id;
      await task.save();

      await challenge.addTasks([task]);

      task.everyX = 2;
      await challenge.updateTask(task);

      const updatedLeader = await User.findOne({ _id: leader._id });
      const updatedUserTask = await Tasks.Task.findById(updatedLeader.tasksOrder.dailys[0]);

      expect(updatedUserTask.everyX).to.eql(2);
    });
  });
});
