import { model as Challenge } from '../../../../../website/server/models/challenge';
import { model as Group } from '../../../../../website/server/models/group';
import { model as User } from '../../../../../website/server/models/user';
import * as Tasks from '../../../../../website/server/models/task';
import { each } from 'lodash';
import { generateHistory } from '../../../../helpers/api-unit.helper.js';

describe('Task Model', () => {
  let guild, leader, challenge, task;
  let tasksToTest = {
    habit: {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
    },
    daily: {
      text: 'test daily',
      type: 'daily',
      frequency: 'daily',
      everyX: 5,
      startDate: new Date(),
    },
  };

  beforeEach(async () => {
    guild = new Group({
      name: 'test guild',
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
        task.history = generateHistory(396);
        await task.save();
      });

      it('preens challenge tasks history when scored', async () => {
        let historyLengthBeforePreen = task.history.length;

        await task.scoreChallengeTask(1.2);

        let updatedTask = await Tasks.Task.findOne({_id: task._id});

        expect(historyLengthBeforePreen).to.be.greaterThan(updatedTask.history.length);
      });
    });
  });

  describe('Static Methods', () => {
    describe('checkShortNameAvailability', () => {
      let user;

      beforeEach(async () => {
        user = new User();
        await user.save();

        let task = new Tasks.todo({
          text: 'Sample todo',
          shortName: 'todo-short-name',
          userId: user._id,
        });

        await task.save();
      });

      it('returns false if another user task has the shortName', async () => {
        let shortNameAvailable = await Tasks.Task.checkShortNameAvailability(user._id, 'todo-short-name');

        expect(shortNameAvailable).to.eql(false);
      });

      it('returns true if no other user task has the shortName', async () => {
        let shortNameAvailable = await Tasks.Task.checkShortNameAvailability(user._id, 'unique-short-name');

        expect(shortNameAvailable).to.eql(true);
      });

      it('returns true if another user has the shortName, but current user does not', async () => {
        let anotherUser = new User();

        let shortNameAvailable = await Tasks.Task.checkShortNameAvailability(anotherUser._id, 'todo-short-name');

        expect(shortNameAvailable).to.eql(true);
      });
    });
  });
});
