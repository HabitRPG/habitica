import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('DELETE /tasks/:id', () => {
  let user;
  let guild;
  let challenge;
  let task;

  before(async () => {
    user = await generateUser();
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
  });

  beforeEach(async () => {
    task = await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test habit',
      type: 'habit',
    });
  });

  it('cannot delete a non-existant task', async () => {
    await expect(user.del(`/tasks/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('returns error when user is not leader of the challenge', async () => {
    let anotherUser = await generateUser();

    await expect(anotherUser.del(`/tasks/${task._id}`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('onlyChalLeaderEditTasks'),
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
});
