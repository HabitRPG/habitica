import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/challenge/:challengeId', () => {
  let user;
  let guild;
  let challenge;

  beforeEach(async () => {
    user = await generateUser({balance: 1});
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
  });

  it('returns error when challenge is not found', async () => {
    let fakeChallengeId = generateUUID();

    await expect(user.post(`/tasks/challenge/${fakeChallengeId}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('returns error when user does not have the challenge', async () => {
    let userWithoutChallenge = await generateUser();

    await expect(userWithoutChallenge.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('returns error when user tries to create task with a alias', async () => {
    await expect(user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test habit',
      type: 'habit',
      alias: 'a-alias',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'habit validation failed',
    });
  });

  it('returns error when non leader tries to edit challenge', async () => {
    let userThatIsNotLeaderOfChallenge = await generateUser({
      challenges: [challenge._id],
    });

    await expect(userThatIsNotLeaderOfChallenge.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('onlyChalLeaderEditTasks'),
    });
  });

  it('creates a habit', async () => {
    let task = await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });
    let challengeWithTask = await user.get(`/challenges/${challenge._id}`);

    expect(challengeWithTask.tasksOrder.habits.indexOf(task._id)).to.be.above(-1);
    expect(task.challenge.id).to.equal(challenge._id);
    expect(task.text).to.eql('test habit');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('habit');
    expect(task.up).to.eql(false);
    expect(task.down).to.eql(true);
  });

  it('creates a todo', async () => {
    let task = await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test todo',
      type: 'todo',
      notes: 1976,
    });
    let challengeWithTask = await user.get(`/challenges/${challenge._id}`);

    expect(challengeWithTask.tasksOrder.todos.indexOf(task._id)).to.be.above(-1);
    expect(task.challenge.id).to.equal(challenge._id);
    expect(task.text).to.eql('test todo');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('todo');
  });

  it('creates a daily', async () => {
    let now = new Date();
    let task = await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test daily',
      type: 'daily',
      notes: 1976,
      frequency: 'daily',
      everyX: 5,
      startDate: now,
    });
    let challengeWithTask = await user.get(`/challenges/${challenge._id}`);

    expect(challengeWithTask.tasksOrder.dailys.indexOf(task._id)).to.be.above(-1);
    expect(task.challenge.id).to.equal(challenge._id);
    expect(task.text).to.eql('test daily');
    expect(task.notes).to.eql('1976');
    expect(task.type).to.eql('daily');
    expect(task.frequency).to.eql('daily');
    expect(task.everyX).to.eql(5);
    expect(new Date(task.startDate)).to.eql(now);
  });
});
