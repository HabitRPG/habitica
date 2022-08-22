import { each } from 'lodash';
import { model as Challenge } from '../../../../website/server/models/challenge';
import { model as Group } from '../../../../website/server/models/group';
import { model as User } from '../../../../website/server/models/user';
import * as Tasks from '../../../../website/server/models/task';
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
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.eql('Task identifier is a required argument');
        }
      });

      it('throws an error if user identifier is not passed in', async () => {
        try {
          await Tasks.Task.findByIdOrAlias(taskWithAlias._id);
          throw new Error('No exception when user_id is undefined');
        } catch (err) {
          expect(err).to.exist;
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.eql('User identifier is a required argument');
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

    describe('findMultipleByIdOrAlias', () => {
      let taskWithAlias;
      let secondTask;
      let user;

      beforeEach(async () => {
        user = new User();
        await user.save();

        taskWithAlias = new Tasks.todo({ // eslint-disable-line new-cap
          text: 'some text',
          alias: 'short-name',
          userId: user.id,
        });
        await taskWithAlias.save();

        secondTask = new Tasks.habit({ // eslint-disable-line new-cap
          text: 'second task',
          alias: 'second-short-name',
          userId: user.id,
        });
        await secondTask.save();

        sandbox.spy(Tasks.Task, 'find');
      });

      it('throws an error if task identifiers is not passed in', async () => {
        try {
          await Tasks.Task.findMultipleByIdOrAlias(null, user._id);
          throw new Error('No exception when Id is None');
        } catch (err) {
          expect(err).to.exist;
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.eql('Task identifiers is a required array argument');
        }
      });

      it('throws an error if task identifiers is not an array', async () => {
        try {
          await Tasks.Task.findMultipleByIdOrAlias('string', user._id);
          throw new Error('No exception when Id is None');
        } catch (err) {
          expect(err).to.exist;
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.eql('Task identifiers is a required array argument');
        }
      });

      it('throws an error if user identifier is not passed in', async () => {
        try {
          await Tasks.Task.findMultipleByIdOrAlias([taskWithAlias._id]);
          throw new Error('No exception when user_id is undefined');
        } catch (err) {
          expect(err).to.exist;
          expect(err).to.be.an.instanceOf(Error);
          expect(err.message).to.eql('User identifier is a required argument');
        }
      });

      it('returns task by id', async () => {
        const foundTasks = await Tasks.Task.findMultipleByIdOrAlias([taskWithAlias._id], user._id);

        expect(foundTasks[0].text).to.eql(taskWithAlias.text);
      });

      it('returns task by alias', async () => {
        const foundTasks = await Tasks.Task.findMultipleByIdOrAlias(
          [taskWithAlias.alias], user._id,
        );

        expect(foundTasks[0].text).to.eql(taskWithAlias.text);
      });

      it('returns multiple tasks', async () => {
        const foundTasks = await Tasks.Task.findMultipleByIdOrAlias(
          [taskWithAlias.alias, secondTask._id], user._id,
        );

        expect(foundTasks.length).to.eql(2);
        expect(foundTasks[0]._id).to.eql(taskWithAlias._id);
        expect(foundTasks[1]._id).to.eql(secondTask._id);
      });

      it('returns a task only once if searched by both id and alias', async () => {
        const foundTasks = await Tasks.Task.findMultipleByIdOrAlias(
          [taskWithAlias.alias, taskWithAlias._id], user._id,
        );

        expect(foundTasks.length).to.eql(1);
        expect(foundTasks[0].text).to.eql(taskWithAlias.text);
      });

      it('scopes alias lookup to user when querying aliases only', async () => {
        await Tasks.Task.findMultipleByIdOrAlias([taskWithAlias.alias], user._id);

        expect(Tasks.Task.find).to.be.calledOnce;
        expect(Tasks.Task.find).to.be.calledWithMatch({
          alias: { $in: [taskWithAlias.alias] },
          userId: user._id,
        });
      });

      it('scopes alias lookup to user when querying aliases and IDs', async () => {
        await Tasks.Task.findMultipleByIdOrAlias([taskWithAlias.alias, secondTask._id], user._id);

        expect(Tasks.Task.find).to.be.calledOnce;
        expect(Tasks.Task.find).to.be.calledWithMatch({
          $or: [
            { _id: { $in: [secondTask._id] } },
            { alias: { $in: [taskWithAlias.alias] } },
          ],
          userId: user._id,
        });
      });

      it('returns empty array if tasks cannot be found', async () => {
        const foundTasks = await Tasks.Task.findMultipleByIdOrAlias(['not-found'], user._id);

        expect(foundTasks).to.eql([]);
      });

      it('accepts additional query parameters', async () => {
        await Tasks.Task.findMultipleByIdOrAlias([taskWithAlias.alias], user._id, { foo: 'bar' });

        expect(Tasks.Task.find).to.be.calledOnce;
        expect(Tasks.Task.find).to.be.calledWithMatch({
          alias: { $in: [taskWithAlias.alias] },
          userId: user._id,
          foo: 'bar',
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
