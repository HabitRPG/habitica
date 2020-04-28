import { each } from 'lodash';
import { model as Challenge } from '../../../../website/server/models/challenge';
import { model as Group } from '../../../../website/server/models/group';
import { model as User } from '../../../../website/server/models/user';
import * as Tasks from '../../../../website/server/models/task';
import { InternalServerError } from '../../../../website/server/libs/errors';
import { generateHistory } from '../../../helpers/api-unit.helper';

describe('Task Model', () => {
  let guild; let leader; let challenge; let
    task;
  const tasksToTest = {
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
      beforeEach(async () => {
        task = new Tasks[`${taskType}`](Tasks.Task.sanitize(taskValue));
        task.challenge.id = challenge._id;
        task.history = generateHistory(396);
        await task.save();
      });

      it('preens challenge tasks history when scored', async () => {
        const historyLengthBeforePreen = task.history.length;

        await task.scoreChallengeTask(1.2);

        const updatedTask = await Tasks.Task.findOne({ _id: task._id });

        expect(historyLengthBeforePreen).to.be.greaterThan(updatedTask.history.length);
      });
    });
  });

  describe('Static Methods', () => {
    describe('findByIdOrAlias', () => {
      let taskWithAlias; let
        user;

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
        const foundTodo = await Tasks.Task.findByIdOrAlias(taskWithAlias._id, user._id);

        expect(foundTodo.text).to.eql(taskWithAlias.text);
      });

      it('returns task by alias', async () => {
        const foundTodo = await Tasks.Task.findByIdOrAlias(taskWithAlias.alias, user._id);

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
        const foundTask = await Tasks.Task.findByIdOrAlias('not-found', user._id);

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
    describe('scoreChallengeTask', () => {
    });

    describe('toJSONV2', () => {
    });
  });
});
