import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('PUT /tasks/:taskId/checklist/:itemId', () => {
  let user;
  let guild;
  let challenge;

  before(async () => {
    user = await generateUser();
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
    await user.post(`/challenges/${challenge._id}/join`);
  });

  it('fails on task not found', async () => {
    const task = await user.post(`/tasks/challenge/${challenge._id}`, {
      type: 'todo',
      text: 'Todo with checklist',
    });

    await expect(user.put(`/tasks/${task._id}/checklist/${generateUUID()}`, {
      text: 'updated',
      completed: true,
      _id: 123, // ignored
    }))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('checklistItemNotFound'),
      });
  });

  it('returns error when user is not a member of the challenge', async () => {
    const task = await user.post(`/tasks/challenge/${challenge._id}`, {
      type: 'todo',
      text: 'Todo with checklist',
    });

    const savedTask = await user.post(`/tasks/${task._id}/checklist`, {
      text: 'Checklist Item 1',
      completed: false,
    });

    const anotherUser = await generateUser();

    await expect(anotherUser.put(`/tasks/${task._id}/checklist/${savedTask.checklist[0].id}`, {
      text: 'updated',
      completed: true,
      _id: 123, // ignored
    }))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlyChalLeaderEditTasks'),
      });
  });

  it('updates a checklist item on dailies', async () => {
    const task = await user.post(`/tasks/challenge/${challenge._id}`, {
      type: 'daily',
      text: 'Daily with checklist',
    });

    let savedTask = await user.post(`/tasks/${task._id}/checklist`, {
      text: 'Checklist Item 1',
      completed: false,
    });

    savedTask = await user.put(`/tasks/${task._id}/checklist/${savedTask.checklist[0].id}`, {
      text: 'updated',
      completed: true,
      _id: 123, // ignored
    });

    expect(savedTask.checklist.length).to.equal(1);
    expect(savedTask.checklist[0].text).to.equal('updated');
    expect(savedTask.checklist[0].completed).to.equal(true);
    expect(savedTask.checklist[0].id).to.not.equal('123');
  });

  it('updates a checklist item on todos', async () => {
    const task = await user.post(`/tasks/challenge/${challenge._id}`, {
      type: 'todo',
      text: 'Todo with checklist',
    });

    let savedTask = await user.post(`/tasks/${task._id}/checklist`, {
      text: 'Checklist Item 1',
      completed: false,
    });

    savedTask = await user.put(`/tasks/${task._id}/checklist/${savedTask.checklist[0].id}`, {
      text: 'updated',
      completed: true,
      _id: 123, // ignored
    });

    expect(savedTask.checklist.length).to.equal(1);
    expect(savedTask.checklist[0].text).to.equal('updated');
    expect(savedTask.checklist[0].completed).to.equal(true);
    expect(savedTask.checklist[0].id).to.not.equal('123');
  });

  it('fails on habits', async () => {
    const habit = await user.post('/tasks/user', {
      type: 'habit',
      text: 'habit with checklist',
    });

    await expect(user.put(`/tasks/${habit._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on rewards', async () => {
    const reward = await user.post('/tasks/user', {
      type: 'reward',
      text: 'reward with checklist',
    });

    await expect(user.put(`/tasks/${reward._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', async () => {
    await expect(user.put(`/tasks/${generateUUID()}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('messageTaskNotFound'),
    });
  });

  it('fails on checklist item not found', async () => {
    const createdTask = await user.post('/tasks/user', {
      type: 'daily',
      text: 'daily with checklist',
    });

    await expect(user.put(`/tasks/${createdTask._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('checklistItemNotFound'),
    });
  });
});
