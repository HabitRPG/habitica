import {
  generateUser,
  translate as t,
  generateGroup,
  sleep,
  generateChallenge,
  server,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /tasks/:id', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('task can be deleted', () => {
    let task;

    beforeEach(async () => {
      task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
        alias: 'task-to-be-deleted',
      });
    });

    it('deletes a user\'s task', async () => {
      await user.del(`/tasks/${task._id}`);

      await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('can use a alias to delete a task', async () => {
      await user.del(`/tasks/${task.alias}`);

      await expect(user.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
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

      let task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });

      await user.post('/user/webhook', {
        url: `http://localhost:${server.port}/webhooks/${uuid}`,
        type: 'taskActivity',
        enabled: true,
        options: {
          created: false,
          deleted: true,
        },
      });

      await user.del(`/tasks/${task.id}`);

      await sleep();

      let body = server.getWebhookData(uuid);

      expect(body.type).to.eql('deleted');
      expect(body.task).to.eql(task);
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
          deleted: true,
        },
      });

      let challengeTask = await user.post(`/tasks/challenge/${challenge._id}`, {
        text: 'test habit',
        type: 'habit',
      });

      await user.del(`/tasks/${challengeTask.id}`);

      await sleep();

      let body = server.getWebhookData(uuid);

      expect(body).to.not.exist;
    });
  });

  context('task cannot be deleted', () => {
    it('cannot delete a non-existant task', async () => {
      await expect(user.del('/tasks/550e8400-e29b-41d4-a716-446655440000')).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('cannot delete a task owned by someone else', async () => {
      let anotherUser = await generateUser();
      let anotherUsersTask = await anotherUser.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });

      await expect(user.del(`/tasks/${anotherUsersTask._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('removes a task from user.tasksOrder'); // TODO
  });
});
