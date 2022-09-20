import { each, findIndex } from 'lodash';
import { model as Group } from '../../../../website/server/models/group';
import { model as User } from '../../../../website/server/models/user';
import * as Tasks from '../../../../website/server/models/task';

describe('Group Task Methods', () => {
  let guild; let leader; let task;
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

  beforeEach(async () => {
    guild = new Group({
      name: 'test party',
      type: 'guild',
    });

    leader = new User({
      guilds: [guild._id],
    });

    guild.leader = leader._id;

    await Promise.all([
      guild.save(),
      leader.save(),
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
        await guild.syncTask(task, [leader], leader);

        const updatedTask = await Tasks.Task.findOne({ _id: task._id });
        expect(updatedTask.group.assignedUsers).to.contain(leader._id);
        expect(updatedTask.group.assignedUsersDetail[leader._id]).to.exist;
      });

      it('creates tags for a user when task is synced', async () => {
        await guild.syncTask(task, [leader], leader);

        const updatedLeader = await User.findOne({ _id: leader._id });
        const tagIndex = findIndex(updatedLeader.tags, { id: guild._id });
        const newTag = updatedLeader.tags[tagIndex];

        expect(newTag.id).to.equal(guild._id);
        expect(newTag.name).to.equal(guild.name);
        expect(newTag.group).to.equal(guild._id);
      });
    });
  });
});
