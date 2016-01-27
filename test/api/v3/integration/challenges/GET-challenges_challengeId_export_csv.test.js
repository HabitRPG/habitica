import {
  generateUser,
  createAndPopulateGroup,
  generateChallenge,
  translate as t,
  sleep,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('GET /challenges/:challengeId/export/csv', () => {
  let groupLeader;
  let group;
  let challenge;
  let members;
  let user;

  beforeEach(async () => {
    user = await generateUser();

    let populatedGroup = await createAndPopulateGroup({
      members: 3,
    });

    groupLeader = populatedGroup.groupLeader;
    group = populatedGroup.group;
    members = populatedGroup.members;

    challenge = await generateChallenge(groupLeader, group);
    await members[0].post(`/challenges/${challenge._id}/join`);
    await members[1].post(`/challenges/${challenge._id}/join`);
    await members[2].post(`/challenges/${challenge._id}/join`);

    await groupLeader.post(`/tasks/challenge/${challenge._id}`, [
      {type: 'habit', text: 'Task 1'},
      {type: 'todo', text: 'Task 2'},
    ]);
    await sleep(1);
  });

  it('fails if challenge doesn\'t exists', async () => {
    await expect(user.get(`/challenges/${generateUUID()}/export/csv`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('fails if user doesn\'t have access to the challenge', async () => {
    await expect(user.get(`/challenges/${challenge._id}/export/csv`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('should return a valid CSV file with export data', async () => {
    await members[0].get(`/challenges/${challenge._id}/export/csv`);
  });
});
