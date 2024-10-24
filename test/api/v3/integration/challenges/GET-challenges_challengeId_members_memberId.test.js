import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  generateChallenge,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /challenges/:challengeId/members/:memberId', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('validates req.params.memberId to be an UUID', async () => {
    await expect(user.get(`/challenges/invalidUUID/members/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('validates req.params.memberId to be an UUID', async () => {
    await expect(user.get(`/challenges/${generateUUID()}/members/invalidUUID`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('fails if member doesn\'t exists', async () => {
    const userId = generateUUID();
    await expect(user.get(`/challenges/${generateUUID()}/members/${userId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', { userId }),
    });
  });

  it('fails if challenge doesn\'t exists', async () => {
    const member = await generateUser();
    await expect(user.get(`/challenges/${generateUUID()}/members/${member._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('fails if user doesn\'t have access to the challenge', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);
    const anotherUser = await generateUser();
    const member = await generateUser();
    await expect(anotherUser.get(`/challenges/${challenge._id}/members/${member._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('fails if member is not part of the challenge', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);
    const member = await generateUser();
    await expect(user.get(`/challenges/${challenge._id}/members/${member._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeMemberNotFound'),
    });
  });

  it('returns the member tasks for the challenges', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);
    await user.post(`/tasks/challenge/${challenge._id}`, [{ type: 'habit', text: 'Test Text' }]);

    const memberProgress = await user.get(`/challenges/${challenge._id}/members/${user._id}`);
    const chalTasks = await user.get(`/tasks/challenge/${challenge._id}`);
    expect(memberProgress.tasks.length).to.equal(chalTasks.length);
    expect(memberProgress.tasks[0].challenge.id).to.equal(challenge._id);
    expect(memberProgress.tasks[0].challenge.taskId).to.equal(chalTasks[0]._id);
  });

  it('returns the tasks without the tags and checklist', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);
    const taskText = 'Test Text';
    await user.post(`/tasks/challenge/${challenge._id}`, [{
      type: 'todo',
      text: taskText,
      checklist: [
        {
          _id: 123,
          text: 'test',
        },
      ],
    }]);

    const memberProgress = await user.get(`/challenges/${challenge._id}/members/${user._id}`);
    expect(memberProgress.tasks[0]).to.not.have.any.keys(['tags', 'checklist']);
  });
});
