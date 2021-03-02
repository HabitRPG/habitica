import { each, find, findIndex } from 'lodash';
import { model as Challenge } from '../../../../website/server/models/challenge';
import { model as Group } from '../../../../website/server/models/group';
import { model as User } from '../../../../website/server/models/user';
import * as Tasks from '../../../../website/server/models/task';

describe('Group Task Methods', () => {
  let guild; let leader; let challenge; let
    task;
  const tasksToTest = {
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
      beforeEach(async () => {
        task = new Tasks[`${taskType}`](Tasks.Task.sanitize(taskValue));
        task.group.id = guild._id;
        await task.save();
        if (task.checklist) {
          task.checklist.push({
            text: 'Checklist Item 1',
            completed: false,
          });
        }
      });

      it('syncs an assigned task to a user', async () => {
        await guild.syncTask(task, leader);

        const updatedLeader = await User.findOne({ _id: leader._id });
        const tagIndex = findIndex(updatedLeader.tags, { id: guild._id });
        const newTag = updatedLeader.tags[tagIndex];

        expect(newTag.id).to.equal(guild._id);
        expect(newTag.name).to.equal(guild.name);
        expect(newTag.group).to.equal(guild._id);
      });

      it('create tags for a user when task is synced', async () => {
        await guild.syncTask(task, leader);

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        const syncedTask = find(updatedLeadersTasks, findLinkedTask);

        expect(task.group.assignedUsers).to.contain(leader._id);
        expect(syncedTask).to.exist;
      });

      it('syncs updated info for assigned task to a user', async () => {
        await guild.syncTask(task, leader);
        const updatedTaskName = 'Update Task name';
        task.text = updatedTaskName;
        await guild.syncTask(task, leader);

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        const syncedTask = find(updatedLeadersTasks, findLinkedTask);

        expect(task.group.assignedUsers).to.contain(leader._id);
        expect(syncedTask).to.exist;
        expect(syncedTask.text).to.equal(task.text);
      });

      it('syncs checklist items to an assigned user', async () => {
        await guild.syncTask(task, leader);

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        const syncedTask = find(updatedLeadersTasks, findLinkedTask);

        if (task.type !== 'daily' && task.type !== 'todo') return;

        expect(syncedTask.checklist.length).to.equal(task.checklist.length);
        expect(syncedTask.checklist[0].text).to.equal(task.checklist[0].text);
      });

      describe('syncs updated info', async () => {
        let newMember;

        beforeEach(async () => {
          newMember = new User({
            guilds: [guild._id],
          });
          await newMember.save();

          await guild.syncTask(task, leader);
          await guild.syncTask(task, newMember);
        });

        it('syncs updated info for assigned task to all users', async () => {
          const updatedTaskName = 'Update Task name';
          task.text = updatedTaskName;
          task.group.approval.required = true;

          await guild.updateTask(task);

          const updatedLeader = await User.findOne({ _id: leader._id });
          const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
          const syncedTask = find(updatedLeadersTasks, findLinkedTask);

          const updatedMember = await User.findOne({ _id: newMember._id });
          const updatedMemberTasks = await Tasks.Task.find({ _id: { $in: updatedMember.tasksOrder[`${taskType}s`] } });
          const syncedMemberTask = find(updatedMemberTasks, findLinkedTask);

          expect(task.group.assignedUsers).to.contain(leader._id);
          expect(syncedTask).to.exist;
          expect(syncedTask.text).to.equal(task.text);
          expect(syncedTask.group.approval.required).to.equal(true);

          expect(task.group.assignedUsers).to.contain(newMember._id);
          expect(syncedMemberTask).to.exist;
          expect(syncedMemberTask.text).to.equal(task.text);
          expect(syncedMemberTask.group.approval.required).to.equal(true);
        });

        it('syncs a new checklist item to all assigned users', async () => {
          if (task.type !== 'daily' && task.type !== 'todo') return;

          const newCheckListItem = {
            text: 'Checklist Item 1',
            completed: false,
          };

          task.checklist.push(newCheckListItem);

          await guild.updateTask(task, { newCheckListItem });

          const updatedLeader = await User.findOne({ _id: leader._id });
          const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
          const syncedTask = find(updatedLeadersTasks, findLinkedTask);

          const updatedMember = await User.findOne({ _id: newMember._id });
          const updatedMemberTasks = await Tasks.Task.find({ _id: { $in: updatedMember.tasksOrder[`${taskType}s`] } });
          const syncedMemberTask = find(updatedMemberTasks, findLinkedTask);

          expect(syncedTask.checklist.length).to.equal(task.checklist.length);
          expect(syncedTask.checklist[1].text).to.equal(task.checklist[1].text);
          expect(syncedMemberTask.checklist.length).to.equal(task.checklist.length);
          expect(syncedMemberTask.checklist[1].text).to.equal(task.checklist[1].text);
        });

        it('syncs updated info for checklist in assigned task to all users when flag is passed', async () => {
          if (task.type !== 'daily' && task.type !== 'todo') return;

          const updateCheckListText = 'Updated checklist item';
          if (task.checklist) {
            task.checklist[0].text = updateCheckListText;
          }

          await guild.updateTask(task, { updateCheckListItems: [task.checklist[0]] });

          const updatedLeader = await User.findOne({ _id: leader._id });
          const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
          const syncedTask = find(updatedLeadersTasks, findLinkedTask);

          const updatedMember = await User.findOne({ _id: newMember._id });
          const updatedMemberTasks = await Tasks.Task.find({ _id: { $in: updatedMember.tasksOrder[`${taskType}s`] } });
          const syncedMemberTask = find(updatedMemberTasks, findLinkedTask);

          expect(syncedTask.checklist.length).to.equal(task.checklist.length);
          expect(syncedTask.checklist[0].text).to.equal(updateCheckListText);
          expect(syncedMemberTask.checklist.length).to.equal(task.checklist.length);
          expect(syncedMemberTask.checklist[0].text).to.equal(updateCheckListText);
        });

        it('removes a checklist item in assigned task to all users when flag is passed with checklist id', async () => {
          if (task.type !== 'daily' && task.type !== 'todo') return;

          await guild.updateTask(task, { removedCheckListItemId: task.checklist[0].id });

          const updatedLeader = await User.findOne({ _id: leader._id });
          const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
          const syncedTask = find(updatedLeadersTasks, findLinkedTask);

          const updatedMember = await User.findOne({ _id: newMember._id });
          const updatedMemberTasks = await Tasks.Task.find({ _id: { $in: updatedMember.tasksOrder[`${taskType}s`] } });
          const syncedMemberTask = find(updatedMemberTasks, findLinkedTask);

          expect(syncedTask.checklist.length).to.equal(0);
          expect(syncedMemberTask.checklist.length).to.equal(0);
        });
      });

      it('removes assigned tasks when master task is deleted', async () => {
        await guild.syncTask(task, leader);
        await guild.removeTask(task);

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedLeadersTasks = await Tasks.Task.find({ userId: leader._id, type: taskType });
        const syncedTask = find(updatedLeadersTasks, findLinkedTask);

        expect(updatedLeader.tasksOrder[`${taskType}s`]).to.not.include(task._id);
        expect(syncedTask).to.not.exist;
      });

      it('unlinks and deletes group tasks for a user when remove-all is specified', async () => {
        await guild.syncTask(task, leader);
        await guild.unlinkTask(task, leader, 'remove-all');

        const updatedLeader = await User.findOne({ _id: leader._id });
        const updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        const syncedTask = find(updatedLeadersTasks, findLinkedTask);

        expect(task.group.assignedUsers).to.not.contain(leader._id);
        expect(syncedTask).to.not.exist;
      });

      it('unlinks and keeps group tasks for a user when keep-all is specified', async () => {
        await guild.syncTask(task, leader);

        let updatedLeader = await User.findOne({ _id: leader._id });
        let updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        const syncedTask = find(updatedLeadersTasks, findLinkedTask);

        await guild.unlinkTask(task, leader, 'keep-all');

        updatedLeader = await User.findOne({ _id: leader._id });
        updatedLeadersTasks = await Tasks.Task.find({ _id: { $in: updatedLeader.tasksOrder[`${taskType}s`] } });
        const updatedSyncedTask = find(
          updatedLeadersTasks,
          updatedLeadersTask => updatedLeadersTask._id === syncedTask._id,
        );

        expect(task.group.assignedUsers).to.not.contain(leader._id);
        expect(updatedSyncedTask).to.exist;
        expect(updatedSyncedTask.group._id).to.be.undefined;
      });
    });
  });
});
