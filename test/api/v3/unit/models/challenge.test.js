import { model as Challenge } from '../../../../../website/src/models/challenge';
import { model as Group } from '../../../../../website/src/models/group';
import { model as User } from '../../../../../website/src/models/user';
import * as Tasks from '../../../../../website/src/models/task';
import { each } from 'lodash';

describe('Challenge Model', () => {
  let guild, leader, challenge, task;
  let tasksToTest = {
    habit: {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    },
    todo: {
      text: 'test todo',
      type: 'todo',
      notes: 1976,
    },
    daily: {
      text: 'test daily',
      type: 'daily',
      notes: 1976,
      frequency: 'daily',
      everyX: 5,
      startDate: new Date(),
    },
    reward: {
      text: 'test reward',
      type: 'reward',
      notes: 1976,
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
      before(async() => {
        task = new Tasks[`${taskType}`](Tasks.Task.sanitizeCreate(taskValue));
      });

      it('adds tasks to challenge and challenge members', async () => {
        await challenge.addTasks([task]);

        let updatedLeader = await User.findOne({_id: leader._id});

        expect(updatedLeader.tasksOrder[`${taskType}s`].length).to.be.above(0);
      });

      it('syncs a challenge to a user', async () => {
        await challenge.addTasks([task]);

        let newMember = new User({
          guilds: [guild._id],
        });
        await newMember.save();

        await challenge.syncToUser(newMember);

        let updatedNewMember = await User.findById(newMember._id);

        expect(updatedNewMember.challenges).to.contain(challenge._id);
        expect(updatedNewMember.tags[3]._id).to.equal(challenge._id);
        expect(updatedNewMember.tags[3].name).to.equal(challenge.shortName);
        expect(updatedNewMember.tasksOrder[`${taskType}s`].length).to.be.above(0);
      });

      it('updates tasks to challenge and challenge members', async () => {
        let updatedTaskName = 'Updated Test Habit';
        await challenge.addTasks([task]);

        _.assign(task, _.merge(task.toObject(), Tasks.Task.sanitizeUpdate({ text: updatedTaskName })));
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
    });
  });
});
