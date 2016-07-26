import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('GET /tasks/:id', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('task can be accessed', async () => {
    let task;

    beforeEach(async () => {
      task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
        alias: 'alias',
      });
    });

    it('gets specified task', async () => {
      let getTask = await user.get(`/tasks/${task._id}`);

      expect(getTask).to.eql(task);
    });

    it('can use alias to retrieve task', async () => {
      let getTask = await user.get(`/tasks/${task.alias}`);

      expect(getTask).to.eql(task);
    });

    // TODO after challenges are implemented
    it('can get active challenge task that user does not own'); // Yes?
  });

  context('task cannot be accessed', () => {
    it('cannot get a non-existant task', async () => {
      let dummyId = generateUUID();

      await expect(user.get(`/tasks/${dummyId}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });

    it('cannot get a task owned by someone else', async () => {
      let anotherUser = await generateUser();
      let task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });

      await expect(anotherUser.get(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
    });
  });
});
