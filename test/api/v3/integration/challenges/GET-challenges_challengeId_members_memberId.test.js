import {
  generateUser,
  generateChallenge,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

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
    let userId = generateUUID();
    await expect(user.get(`/challenges/${generateUUID()}/members/${userId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', {userId}),
    });
  });

  it('fails if challenge doesn\'t exists', async () => {
    let member = await generateUser();
    await expect(user.get(`/challenges/${generateUUID()}/members/${member._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('fails if user doesn\'t have access to the challenge', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let challenge = await generateChallenge(user, group);
    let anotherUser = await generateUser();
    let member = await generateUser();
    await expect(anotherUser.get(`/challenges/${challenge._id}/members/${member._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('fails if member is not part of the challenge', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let challenge = await generateChallenge(user, group);
    let member = await generateUser();
    await expect(user.get(`/challenges/${challenge._id}/members/${member._id}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeMemberNotFound'),
    });
  });

  it('works with challenges belonging to a public guild', async () => {
    let groupLeader = await generateUser({balance: 4});
    let group = await generateGroup(groupLeader, {type: 'guild', privacy: 'public', name: generateUUID()});
    let challenge = await generateChallenge(groupLeader, group);
    let taskText = 'Test Text';
    await groupLeader.post(`/tasks/challenge/${challenge._id}`, [{type: 'habit', text: taskText}]);

    let memberProgress = await user.get(`/challenges/${challenge._id}/members/${groupLeader._id}`);
    expect(memberProgress).to.have.all.keys(['_id', 'id', 'profile', 'tasks']);
    expect(memberProgress.profile).to.have.all.keys(['name']);
    expect(memberProgress.tasks.length).to.equal(1);
  });

  it('returns the member tasks for the challenges', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let challenge = await generateChallenge(user, group);
    await user.post(`/tasks/challenge/${challenge._id}`, [{type: 'habit', text: 'Test Text'}]);

    let memberProgress = await user.get(`/challenges/${challenge._id}/members/${user._id}`);
    let chalTasks = await user.get(`/tasks/challenge/${challenge._id}`);
    expect(memberProgress.tasks.length).to.equal(chalTasks.length);
    expect(memberProgress.tasks[0].challenge.id).to.equal(challenge._id);
    expect(memberProgress.tasks[0].challenge.taskId).to.equal(chalTasks[0]._id);
  });

  it('returns the tasks without the tags', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let challenge = await generateChallenge(user, group);
    let taskText = 'Test Text';
    await user.post(`/tasks/challenge/${challenge._id}`, [{type: 'habit', text: taskText}]);

    let memberProgress = await user.get(`/challenges/${challenge._id}/members/${user._id}`);
    expect(memberProgress.tasks[0]).not.to.have.key('tags');
  });
});
