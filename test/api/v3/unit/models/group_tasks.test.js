import { model as Challenge } from '../../../../../website/server/models/challenge';
import { model as Group } from '../../../../../website/server/models/group';
import { model as User } from '../../../../../website/server/models/user';
import * as Tasks from '../../../../../website/server/models/task';
import { each, find } from 'lodash';

describe('Group Task Methods', () => {
  let guild, leader, challenge, task;
  let tasksToTest = {
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

  function findLinkedTask (updatedLeadersTask) {
    return updatedLeadersTask.group.taskId === task._id;
  }

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
      beforeEach(async() => {
        task = new Tasks[`${taskType}`](Tasks.Task.sanitize(taskValue));
        task.group.id = guild._id;
        await task.save();
      });

      it('syncs an assigned task to a user', async () => {
        await guild.syncTask(task, leader);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, findLinkedTask);

        expect(task.group.assignedUsers).to.contain(leader._id);
        expect(syncedTask).to.exist;
      });

      it('syncs updated info for assigned task to a user', async () => {
        await guild.syncTask(task, leader);
        let updatedTaskName = 'Update Task name';
        task.text = updatedTaskName;
        await guild.syncTask(task, leader);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, findLinkedTask);

        expect(task.group.assignedUsers).to.contain(leader._id);
        expect(syncedTask).to.exist;
        expect(syncedTask.text).to.equal(task.text);
      });

      it('syncs updated info for assigned task to all users', async () => {
        let newMember = new User({
          guilds: [guild._id],
        });
        await newMember.save();

        await guild.syncTask(task, leader);
        await guild.syncTask(task, newMember);

        let updatedTaskName = 'Update Task name';
        task.text = updatedTaskName;

        await guild.updateTask(task);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, findLinkedTask);

        let updatedMember = await User.findOne({_id: newMember._id});
        let updatedMemberTasks = await Tasks.Task.find({_id: { $in: updatedMember.tasksOrder[`${taskType}s`]}});
        let syncedMemberTask = find(updatedMemberTasks, findLinkedTask);

        expect(task.group.assignedUsers).to.contain(leader._id);
        expect(syncedTask).to.exist;
        expect(syncedTask.text).to.equal(task.text);

        expect(task.group.assignedUsers).to.contain(newMember._id);
        expect(syncedMemberTask).to.exist;
        expect(syncedMemberTask.text).to.equal(task.text);
      });

      it('removes an assigned task and unlinks assignees', async () => {
        await guild.syncTask(task, leader);
        await guild.removeTask(task);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, findLinkedTask);

        expect(syncedTask.group.broken).to.equal('TASK_DELETED');
      });

      it('unlinks and deletes group tasks for a user when remove-all is specified', async () => {
        await guild.syncTask(task, leader);
        await guild.unlinkTask(task, leader, 'remove-all');

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, findLinkedTask);

        expect(task.group.assignedUsers).to.not.contain(leader._id);
        expect(syncedTask).to.not.exist;
      });

      it('unlinks and keeps group tasks for a user when keep-all is specified', async () => {
        await guild.syncTask(task, leader);

        let updatedLeader = await User.findOne({_id: leader._id});
        let updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let syncedTask = find(updatedLeadersTasks, findLinkedTask);

        await guild.unlinkTask(task, leader, 'keep-all');

        updatedLeader = await User.findOne({_id: leader._id});
        updatedLeadersTasks = await Tasks.Task.find({_id: { $in: updatedLeader.tasksOrder[`${taskType}s`]}});
        let updatedSyncedTask = find(updatedLeadersTasks, function findUpdatedLinkedTask (updatedLeadersTask) {
          return updatedLeadersTask._id === syncedTask._id;
        });

        expect(task.group.assignedUsers).to.not.contain(leader._id);
        expect(updatedSyncedTask).to.exist;
        expect(updatedSyncedTask.group._id).to.be.empty;
      });
    });
  });
});
