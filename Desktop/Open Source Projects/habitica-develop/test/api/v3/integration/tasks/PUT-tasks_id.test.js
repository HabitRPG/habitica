import moment from 'moment';
import {
  generateUser,
  generateGroup,
  sleep,
  generateChallenge,
  server,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('PUT /tasks/:id', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('validates params', () => {
    let task;

    beforeEach(async () => {
      task = await user.post('/tasks/user', {
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
      });

      expect(savedTask._id).to.equal(task._id);
      expect(savedTask.type).to.equal(task.type);
      expect(savedTask.userId).to.equal(task.userId);
      expect(savedTask.history).to.eql(task.history);
      expect(savedTask.createdAt).to.equal(task.createdAt);
      expect(savedTask.updatedAt).to.be.greaterThan(task.updatedAt);
      expect(savedTask.challenge).to.eql(task.challenge);
      expect(savedTask.completed).to.eql(task.completed);
      expect(savedTask.streak).to.equal(savedTask.streak); // it's an habit, dailies can change it
      expect(savedTask.dateCompleted).to.equal(task.dateCompleted);
    });

    it('ignores invalid fields', async () => {
      let savedTask = await  user.put(`/tasks/${task._id}`, {
        notValid: true,
      });

      expect(savedTask.notValid).to.be.undefined;
    });

    it(`only allows setting streak, alias, reminders, checklist, notes, attribute, tags
        fields for challenge tasks owned by a user`, async () => {
      let guild = await generateGroup(user);
      let challenge = await generateChallenge(user, guild);

      let challengeTask = await user.post(`/tasks/challenge/${challenge._id}`, {
        type: 'daily',
        text: 'Daily in challenge',
        reminders: [
          {time: new Date(), startDate: new Date()},
        ],
        checklist: [
          {text: 123, completed: false},
        ],
        collapseChecklist: false,
      });
      await sleep(2);

      await user.sync();

      // Pick challenge task
      let challengeUserTaskId = user.tasksOrder.dailys[user.tasksOrder.dailys.length - 1];

      let challengeUserTask = await user.get(`/tasks/${challengeUserTaskId}`);

      let savedChallengeUserTask = await user.put(`/tasks/${challengeUserTaskId}`, {
        _id: 123,
        type: 'daily',
        userId: 123,
        alias: 'a-short-task-name',
        history: [123],
        createdAt: 'yesterday',
        updatedAt: 'tomorrow',
        challenge: 'no',
        completed: true,
        streak: 25,
        priority: 1.5,
        repeat: {
          m: false,
        },
        everyX: 15,
        frequency: 'weekly',
        text: 'new text',
        dateCompleted: 'never',
        reminders: [
          {time: new Date(), startDate: new Date()},
          {time: new Date(), startDate: new Date()},
        ],
        checklist: [
          {text: 123, completed: false},
          {text: 456, completed: true},
        ],
        collapseChecklist: true,
        notes: 'new notes',
        attribute: 'per',
        tags: [challengeUserTaskId],
      });

      // original task is not touched
      let updatedChallengeTask = await user.get(`/tasks/${challengeTask._id}`);
      expect(updatedChallengeTask).to.eql(challengeTask);

      // ignored
      expect(savedChallengeUserTask._id).to.equal(challengeUserTask._id);
      expect(savedChallengeUserTask.type).to.equal(challengeUserTask.type);
      expect(savedChallengeUserTask.repeat.m).to.equal(true);
      expect(savedChallengeUserTask.priority).to.equal(challengeUserTask.priority);
      expect(savedChallengeUserTask.frequency).to.equal(challengeUserTask.frequency);
      expect(savedChallengeUserTask.userId).to.equal(challengeUserTask.userId);
      expect(savedChallengeUserTask.text).to.equal(challengeUserTask.text);
      expect(savedChallengeUserTask.history).to.eql(challengeUserTask.history);
      expect(savedChallengeUserTask.createdAt).to.equal(challengeUserTask.createdAt);
      expect(savedChallengeUserTask.updatedAt).to.be.greaterThan(challengeUserTask.updatedAt);
      expect(savedChallengeUserTask.challenge).to.eql(challengeUserTask.challenge);
      expect(savedChallengeUserTask.completed).to.equal(challengeUserTask.completed);
      expect(savedChallengeUserTask.dateCompleted).to.equal(challengeUserTask.dateCompleted);
      expect(savedChallengeUserTask.priority).to.equal(challengeUserTask.priority);

      // changed
      expect(savedChallengeUserTask.notes).to.equal('new notes');
      expect(savedChallengeUserTask.attribute).to.equal('per');
      expect(savedChallengeUserTask.tags).to.eql([challengeUserTaskId]);
      expect(savedChallengeUserTask.streak).to.equal(25);
      expect(savedChallengeUserTask.reminders.length).to.equal(2);
      expect(savedChallengeUserTask.checklist.length).to.equal(2);
      expect(savedChallengeUserTask.alias).to.equal('a-short-task-name');
      expect(savedChallengeUserTask.collapseChecklist).to.equal(true);
    });
  });

  context('sending task activity webhooks', () => {
    before(async () => {
      await server.start();
    });

    after(async () => {
      await server.close();
    });

    it('sends task activity webhooks if task is user owned', async () => {
      let uuid = generateUUID();

      await user.post('/user/webhook', {
        url: `http://localhost:${server.port}/webhooks/${uuid}`,
        type: 'taskActivity',
        enabled: true,
        options: {
          created: false,
          updated: true,
        },
      });

      let task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });

      let updatedTask = await user.put(`/tasks/${task.id}`, {
        text: 'updated text',
      });

      await sleep();

      let body = server.getWebhookData(uuid);

      expect(body.type).to.eql('updated');
      expect(body.task).to.eql(updatedTask);
    });

    it('does not send task activity webhooks if task is not user owned', async () => {
      let uuid = generateUUID();

      await user.update({
        balance: 10,
      });
      let guild = await generateGroup(user);
      let challenge = await generateChallenge(user, guild);

      await user.post('/user/webhook', {
        url: `http://localhost:${server.port}/webhooks/${uuid}`,
        type: 'taskActivity',
        enabled: true,
        options: {
          created: false,
          updated: true,
        },
      });

      let task = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test habit',
        type: 'habit',
      });

      await user.put(`/tasks/${task.id}`, {
        text: 'updated text',
      });

      await sleep();

      let body = server.getWebhookData(uuid);

      expect(body).to.not.exist;
    });
  });

  context('all types', () => {
    let daily;

    beforeEach(async () => {
      daily = await user.post('/tasks/user', {
        text: 'test daily',
        type: 'daily',
        notes: 1976,
      });
    });

    it('can update reminders (replace them)', async () => {
      await user.put(`/tasks/${daily._id}`, {
        reminders: [
          {time: new Date(), startDate: new Date()},
        ],
      });

      let id1 = generateUUID();
      let id2 = generateUUID();

      let savedDaily = await user.put(`/tasks/${daily._id}`, {
        reminders: [
          {id: id1, time: new Date(), startDate: new Date()},
          {id: id2, time: new Date(), startDate: new Date()},
        ],
      });

      expect(savedDaily.reminders.length).to.equal(2);
      expect(savedDaily.reminders[0].id).to.equal(id1);
      expect(savedDaily.reminders[1].id).to.equal(id2);
    });

    it('can set a alias if no other task has that alias', async () => {
      let savedDaily = await user.put(`/tasks/${daily._id}`, {
        alias: 'alias',
      });

      expect(savedDaily.alias).to.eql('alias');
    });

    it('does not set alias to a alias that is already in use', async () => {
      await user.post('/tasks/user', {
        type: 'todo',
        text: 'a todo',
        alias: 'some-alias',
      });

      await expect(user.put(`/tasks/${daily._id}`, {
        alias: 'some-alias',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'daily validation failed',
      });
    });

    it('can use alias to update a task', async () => {
      daily = await user.put(`/tasks/${daily._id}`, {
        alias: 'alias',
      });

      await user.put(`/tasks/${daily.alias}`, {
        text: 'saved',
      });

      let fetchedDaily = await user.get(`/tasks/${daily._id}`);

      expect(fetchedDaily.text).to.eql('saved');
    });
  });

  context('habits', () => {
    let habit;

    beforeEach(async () => {
      habit = await user.post('/tasks/user', {
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
  });

  context('todos', () => {
    let todo;

    beforeEach(async () => {
      todo = await user.post('/tasks/user', {
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
      daily = await user.post('/tasks/user', {
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
        yesterDaily: false,
        startDate: moment().add(1, 'days').toDate(),
      });

      expect(savedDaily.text).to.eql('some new text');
      expect(savedDaily.notes).to.eql('some new notes');
      expect(savedDaily.frequency).to.eql('daily');
      expect(savedDaily.everyX).to.eql(5);
      expect(savedDaily.isDue).to.be.false;
      expect(savedDaily.nextDue.length).to.eql(6);
      expect(savedDaily.yesterDaily).to.be.false;
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
      reward = await user.post('/tasks/user', {
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
        value: 10,
      });

      expect(savedReward.text).to.eql('some new text');
      expect(savedReward.notes).to.eql('some new notes');
      expect(savedReward.value).to.eql(10);
    });

    it('requires value to be coerced into a number', async () => {
      let savedReward = await user.put(`/tasks/${reward._id}`, {
        value: '100',
      });

      expect(savedReward.value).to.eql(100);
    });
  });
});
