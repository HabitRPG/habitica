import { model as Challenge } from '../../../../../website/server/models/challenge';
import { model as Group } from '../../../../../website/server/models/group';
import { model as User } from '../../../../../website/server/models/user';
import * as Tasks from '../../../../../website/server/models/task';
import { InternalServerError } from '../../../../../website/server/libs/errors';
import { each } from 'lodash';
import { generateHistory } from '../../../../helpers/api-unit.helper.js';
import shared from '../../../../../website/common';

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
    describe('findByIdOrAlias', () => {
      let taskWithAlias, user;

      beforeEach(async () => {
        user = new User();
        await user.save();

        taskWithAlias = new Tasks.todo({ // eslint-disable-line new-cap
          text: 'some text',
          alias: 'short-name',
          userId: user.id,
        });
        await taskWithAlias.save();

        sandbox.spy(Tasks.Task, 'findOne');
      });

      it('throws an error if task identifier is not passed in', async () => {
        try {
          await Tasks.Task.findByIdOrAlias(null, user._id);
          throw new Error('No exception when Id is None');
        } catch (err) {
          expect(err).to.exist;
          expect(err).to.eql(new InternalServerError('Task identifier is a required argument'));
        }
      });

      it('throws an error if user identifier is not passed in', async () => {
        try {
          await Tasks.Task.findByIdOrAlias(taskWithAlias._id);
          throw new Error('No exception when user_id is undefined');
        } catch (err) {
          expect(err).to.exist;
          expect(err).to.eql(new InternalServerError('User identifier is a required argument'));
        }
      });

      it('returns task by id', async () => {
        let foundTodo = await Tasks.Task.findByIdOrAlias(taskWithAlias._id, user._id);

        expect(foundTodo.text).to.eql(taskWithAlias.text);
      });

      it('returns task by alias', async () => {
        let foundTodo = await Tasks.Task.findByIdOrAlias(taskWithAlias.alias, user._id);

        expect(foundTodo.text).to.eql(taskWithAlias.text);
      });

      it('scopes alias lookup to user', async () => {
        await Tasks.Task.findByIdOrAlias(taskWithAlias.alias, user._id);

        expect(Tasks.Task.findOne).to.be.calledOnce;
        expect(Tasks.Task.findOne).to.be.calledWithMatch({
          alias: taskWithAlias.alias,
          userId: user._id,
        });
      });

      it('returns null if task cannot be found', async () => {
        let foundTask = await Tasks.Task.findByIdOrAlias('not-found', user._id);

        expect(foundTask).to.eql(null);
      });

      it('accepts additional query parameters', async () => {
        await Tasks.Task.findByIdOrAlias(taskWithAlias.alias, user._id, { foo: 'bar' });

        expect(Tasks.Task.findOne).to.be.calledOnce;
        expect(Tasks.Task.findOne).to.be.calledWithMatch({
          foo: 'bar',
          alias: taskWithAlias.alias,
          userId: user._id,
        });
      });
    });

    describe('sanitizeUserChallengeTask ', () => {
    });

    describe('sanitizeChecklist ', () => {
    });

    describe('sanitizeReminder ', () => {
    });

    describe('fromJSONV2 ', () => {
    });
  });

  describe('Instance Methods', () => {
    describe('withIsDue', () => {
      it('returns the doc if task is not owned by the user', () => {
        let daily = new Tasks.daily({ // eslint-disable-line new-cap
          text: 'Daily',
          userId: 'user-id',
        });

        let dailyObj = daily.withIsDue({
          _id: 'not-user-id',
        });

        expect(daily).to.equal(dailyObj);
      });

      it('does not include isDue if not owned by the user', () => {
        let daily = new Tasks.daily({ // eslint-disable-line new-cap
          text: 'Daily',
          userId: 'user-id',
        });

        let dailyObj = daily.withIsDue({
          _id: 'not-user-id',
        });

        expect(dailyObj.isDue).to.not.exist;
      });

      it('returns a plain javascript object if task is owned by user', () => {
        let daily = new Tasks.daily({ // eslint-disable-line new-cap
          text: 'Daily',
          userId: 'user-id',
        });

        let dailyObj = daily.withIsDue({
          _id: 'user-id',
        });

        expect(daily).to.not.equal(dailyObj);
        expect(daily.text).to.equal(dailyObj.text);
      });

      it('includes an isDue property', () => {
        let daily = new Tasks.daily({ // eslint-disable-line new-cap
          text: 'Daily',
          userId: 'user-id',
        });

        let dailyObj = daily.withIsDue({
          _id: 'user-id',
        });

        expect(dailyObj.isDue).to.be.a('boolean');
      });

      it('calls shared.shouldDo to calculate isDue', () => {
        sandbox.spy(shared, 'shouldDo');

        let user = {
          _id: 'user-id',
          preferences: {},
        };
        let daily = new Tasks.daily({ // eslint-disable-line new-cap
          text: 'Daily',
          userId: 'user-id',
        });

        daily.withIsDue(user);

        expect(shared.shouldDo).to.be.calledOnce;
        expect(shared.shouldDo).to.be.calledWith(sandbox.match.number, daily, user.preferences);
      });
    });

    describe('scoreChallengeTask', () => {
    });

    describe('toJSONV2', () => {
    });
  });
});
