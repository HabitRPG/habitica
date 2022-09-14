import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
  server,
  sleep,
} from '../../../../../helpers/api-integration/v3';

describe('POST /tasks/:taskId/checklist/:itemId/score', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('scores a checklist item', async () => {
    const task = await user.post('/tasks/user', {
      type: 'daily',
      text: 'Daily with checklist',
    });

    let savedTask = await user.post(`/tasks/${task._id}/checklist`, {
      text: 'Checklist Item 1',
      completed: false,
    });

    savedTask = await user.post(`/tasks/${task._id}/checklist/${savedTask.checklist[0].id}/score`);

    expect(savedTask.checklist.length).to.equal(1);
    expect(savedTask.checklist[0].completed).to.equal(true);
  });

  it('can use an alias to score a checklist item', async () => {
    const task = await user.post('/tasks/user', {
      type: 'daily',
      text: 'Daily with checklist',
      alias: 'daily-with-shortname',
    });

    let savedTask = await user.post(`/tasks/${task._id}/checklist`, {
      text: 'Checklist Item 1',
      completed: false,
    });

    savedTask = await user.post(`/tasks/${task.alias}/checklist/${savedTask.checklist[0].id}/score`);

    expect(savedTask.checklist.length).to.equal(1);
    expect(savedTask.checklist[0].completed).to.equal(true);
  });

  it('fails on habits', async () => {
    const habit = await user.post('/tasks/user', {
      type: 'habit',
      text: 'habit with checklist',
    });

    await expect(user.post(`/tasks/${habit._id}/checklist/${generateUUID()}/score`, {
      text: 'Checklist Item 1',
    })).to.eventually.be.rejected.and.eql({
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

    await expect(user.post(`/tasks/${reward._id}/checklist/${generateUUID()}/score`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', async () => {
    await expect(user.post(`/tasks/${generateUUID()}/checklist/${generateUUID()}/score`)).to.eventually.be.rejected.and.eql({
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

    await expect(user.post(`/tasks/${createdTask._id}/checklist/${generateUUID()}/score`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('checklistItemNotFound'),
    });
  });

  context('sending task activity webhooks', () => {
    before(async () => {
      await server.start();
    });

    after(async () => {
      await server.close();
    });

    it('sends task activity webhooks', async () => {
      const uuid = generateUUID();

      await user.post('/user/webhook', {
        url: `http://localhost:${server.port}/webhooks/${uuid}`,
        type: 'taskActivity',
        enabled: true,
        options: {
          checklistScored: true,
          updated: false,
        },
      });

      const task = await user.post('/tasks/user', {
        text: 'test daily',
        type: 'daily',
      });

      const updatedTask = await user.post(`/tasks/${task.id}/checklist`, {
        text: 'checklist item text',
      });

      const checklistItem = updatedTask.checklist[0];

      const scoredItemTask = await user.post(`/tasks/${task.id}/checklist/${checklistItem.id}/score`);

      await sleep();

      const body = server.getWebhookData(uuid);

      expect(body.type).to.eql('checklistScored');
      expect(body.task).to.eql(scoredItemTask);
      expect(body.item).to.eql(scoredItemTask.checklist[0]);
    });
  });
});
