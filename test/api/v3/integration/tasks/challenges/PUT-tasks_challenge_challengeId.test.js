import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('PUT /tasks/:id', () => {
  let user;
  let guild;
  let challenge;

  before(async () => {
    user = await generateUser();
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
  });

  context('errors', () => {
    let task;

    beforeEach(async () => {
      task = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test habit',
        type: 'habit',
      });
    });

    it('returns error when incorrect id is passed', async () => {
      await expect(user.put(`/tasks/${generateUUID()}`, {
        text: 'some new text',
        up: false,
        down: false,
        notes: 'some new notes',
      })).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('returns error when user is not a member of the challenge', async () => {
      let anotherUser = await generateUser();

      await expect(anotherUser.put(`/tasks/${task._id}`, {
        text: 'some new text',
        up: false,
        down: false,
        notes: 'some new notes',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyChalLeaderEditTasks'),
      });
    });

    it('returns error when user attempts to update task with a alias', async () => {
      await expect(user.put(`/tasks/${task._id}`, {
        alias: 'a-alias',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'habit validation failed',
      });
    });
  });

  context('validates params', () => {
    let task;

    beforeEach(async () => {
      task = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test habit',
        type: 'habit',
      });
    });

    it(`ignores setting _id, type, userId, history, createdAt,
                        updatedAt, challenge, completed, streak,
                        dateCompleted fields`, async () => {
      let savedTask = await user.put(`/tasks/${task._id}`, {
        _id: 123,
        type: 'daily',
        userId: 123,
        history: [123],
        createdAt: 'yesterday',
        updatedAt: 'tomorrow',
        challenge: 'no',
        completed: true,
        streak: 25,
        dateCompleted: 'never',
        value: 324, // ignored because not a reward
      });

      expect(savedTask._id).to.equal(task._id);
      expect(savedTask.type).to.equal(task.type);
      expect(savedTask.userId).to.equal(task.userId);
      expect(savedTask.history).to.eql(task.history);
      expect(savedTask.createdAt).to.equal(task.createdAt);
      expect(savedTask.updatedAt).to.be.greaterThan(task.updatedAt);
      expect(savedTask.challenge._id).to.equal(task.challenge._id);
      expect(savedTask.completed).to.equal(task.completed);
      expect(savedTask.streak).to.equal(task.streak);
      expect(savedTask.dateCompleted).to.equal(task.dateCompleted);
      expect(savedTask.value).to.equal(task.value);
    });

    it('ignores invalid fields', async () => {
      let savedTask = await user.put(`/tasks/${task._id}`, {
        notValid: true,
      });

      expect(savedTask.notValid).to.be.undefined;
    });
  });

  context('habits', () => {
    let habit;

    beforeEach(async () => {
      habit = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test habit',
        type: 'habit',
        notes: 1976,
      });
    });

    it('updates a habit', async () => {
      let savedHabit = await user.put(`/tasks/${habit._id}`, {
        text: 'some new text',
        up: false,
        down: false,
        notes: 'some new notes',
      });

      expect(savedHabit.text).to.eql('some new text');
      expect(savedHabit.notes).to.eql('some new notes');
      expect(savedHabit.up).to.eql(false);
      expect(savedHabit.down).to.eql(false);
    });

    it('allows user to update their copy', async () => {
      const userTasks = await user.get('/tasks/user');
      const userChallengeTasks = userTasks.filter(task => task.challenge.id === challenge._id);
      const userCopyOfChallengeTask = userChallengeTasks[0];

      await user.put(`/tasks/${userCopyOfChallengeTask._id}`, {
        notes: 'some new notes',
        counterDown: 1,
        counterUp: 2,
      });
      const savedHabit = await user.get(`/tasks/${userCopyOfChallengeTask._id}`);

      expect(savedHabit.notes).to.eql('some new notes');
      expect(savedHabit.counterDown).to.eql(1);
      expect(savedHabit.counterUp).to.eql(2);
    });
  });

  context('todos', () => {
    let todo;

    beforeEach(async () => {
      todo = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test todo',
        type: 'todo',
        notes: 1976,
      });
    });

    it('updates a todo', async () => {
      let savedTodo = await user.put(`/tasks/${todo._id}`, {
        text: 'some new text',
        notes: 'some new notes',
      });

      expect(savedTodo.text).to.eql('some new text');
      expect(savedTodo.notes).to.eql('some new notes');
    });

    it('can update checklists (replace it)', async () => {
      await user.put(`/tasks/${todo._id}`, {
        checklist: [
          {text: 123, completed: false},
          {text: 456, completed: true},
        ],
      });

      let savedTodo = await user.put(`/tasks/${todo._id}`, {
        checklist: [
          {text: 789, completed: false},
        ],
      });

      expect(savedTodo.checklist.length).to.equal(1);
      expect(savedTodo.checklist[0].text).to.equal('789');
      expect(savedTodo.checklist[0].completed).to.equal(false);
    });

    it('can update tags (replace them)', async () => {
      let finalUUID = generateUUID();
      await user.put(`/tasks/${todo._id}`, {
        tags: [generateUUID(), generateUUID()],
      });

      let savedTodo = await user.put(`/tasks/${todo._id}`, {
        tags: [finalUUID],
      });

      expect(savedTodo.tags.length).to.equal(1);
      expect(savedTodo.tags[0]).to.equal(finalUUID);
    });
  });

  context('dailys', () => {
    let daily;

    beforeEach(async () => {
      daily = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test daily',
        type: 'daily',
        notes: 1976,
      });
    });

    it('updates a daily', async () => {
      let savedDaily = await user.put(`/tasks/${daily._id}`, {
        text: 'some new text',
        notes: 'some new notes',
        frequency: 'daily',
        everyX: 5,
      });

      expect(savedDaily.text).to.eql('some new text');
      expect(savedDaily.notes).to.eql('some new notes');
      expect(savedDaily.frequency).to.eql('daily');
      expect(savedDaily.everyX).to.eql(5);
    });

    it('can update checklists (replace it)', async () => {
      await user.put(`/tasks/${daily._id}`, {
        checklist: [
          {text: 123, completed: false},
          {text: 456, completed: true},
        ],
      });

      let savedDaily = await user.put(`/tasks/${daily._id}`, {
        checklist: [
          {text: 789, completed: false},
        ],
      });

      expect(savedDaily.checklist.length).to.equal(1);
      expect(savedDaily.checklist[0].text).to.equal('789');
      expect(savedDaily.checklist[0].completed).to.equal(false);
    });

    it('can update tags (replace them)', async () => {
      let finalUUID = generateUUID();
      await user.put(`/tasks/${daily._id}`, {
        tags: [generateUUID(), generateUUID()],
      });

      let savedDaily = await user.put(`/tasks/${daily._id}`, {
        tags: [finalUUID],
      });

      expect(savedDaily.tags.length).to.equal(1);
      expect(savedDaily.tags[0]).to.equal(finalUUID);
    });

    it('updates repeat, even if frequency is set to daily', async () => {
      await user.put(`/tasks/${daily._id}`, {
        frequency: 'daily',
      });

      let savedDaily = await user.put(`/tasks/${daily._id}`, {
        repeat: {
          m: false,
          su: false,
        },
      });

      expect(savedDaily.repeat).to.eql({
        m: false,
        t: true,
        w: true,
        th: true,
        f: true,
        s: true,
        su: false,
      });
    });

    it('updates everyX, even if frequency is set to weekly', async () => {
      await user.put(`/tasks/${daily._id}`, {
        frequency: 'weekly',
      });

      let savedDaily = await user.put(`/tasks/${daily._id}`, {
        everyX: 5,
      });

      expect(savedDaily.everyX).to.eql(5);
    });

    it('defaults startDate to today if none date object is passed in', async () => {
      let savedDaily = await user.put(`/tasks/${daily._id}`, {
        frequency: 'weekly',
      });

      expect((new Date(savedDaily.startDate)).getDay()).to.eql((new Date()).getDay());
    });
  });

  context('rewards', () => {
    let reward;

    beforeEach(async () => {
      reward = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test reward',
        type: 'reward',
        notes: 1976,
        value: 10,
      });
    });

    it('updates a reward', async () => {
      let savedReward = await user.put(`/tasks/${reward._id}`, {
        text: 'some new text',
        notes: 'some new notes',
        value: 11,
      });

      expect(savedReward.text).to.eql('some new text');
      expect(savedReward.notes).to.eql('some new notes');
      expect(savedReward.value).to.eql(11);
    });

    it('requires value to be coerced into a number', async () => {
      let savedReward = await user.put(`/tasks/${reward._id}`, {
        value: '100',
      });

      expect(savedReward.value).to.eql(100);
    });
  });
});
