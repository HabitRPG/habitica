import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  createAndPopulateGroup,
  generateChallenge,
  translate as t,
  sleep,
} from '../../../../helpers/api-integration/v3';

describe('GET /challenges/:challengeId/export/csv', () => {
  let groupLeader;
  let group;
  let challenge;
  let members;
  let user;

  beforeEach(async () => {
    const populatedGroup = await createAndPopulateGroup({
      members: 3,
    });

    groupLeader = populatedGroup.groupLeader;
    group = populatedGroup.group;
    members = populatedGroup.members;

    challenge = await generateChallenge(groupLeader, group);
    await groupLeader.post(`/challenges/${challenge._id}/join`);
    await members[0].post(`/challenges/${challenge._id}/join`);
    await members[1].post(`/challenges/${challenge._id}/join`);
    await members[2].post(`/challenges/${challenge._id}/join`);

    await groupLeader.post(`/tasks/challenge/${challenge._id}`, [
      { type: 'habit', text: 'Task 1' },
      { type: 'todo', text: 'Task 2' },
    ]);
    await sleep(0.5); // Make sure tasks are synced to the users
    await members[0].sync();
    await members[1].sync();
    await members[2].sync();
  });

  it('fails if challenge doesn\'t exists', async () => {
    user = await generateUser();
    user.get('/user');
    await expect(user.get(`/challenges/${generateUUID()}/export/csv`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('fails if user doesn\'t have access to the challenge', async () => {
    user = await generateUser();
    user.get('/user');

    await expect(user.get(`/challenges/${challenge._id}/export/csv`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('should return a valid CSV file with export data', async () => {
    const res = await members[0].get(`/challenges/${challenge._id}/export/csv`);
    const sortedMembers = _.sortBy([members[0], members[1], members[2], groupLeader], '_id');
    const splitRes = res.split('\n');

    expect(splitRes[0]).to.equal('UUID,Display Name,Username,Task,Value,Notes,Streak,Task,Value,Notes,Streak');
    expect(splitRes[1]).to.equal(`${sortedMembers[0]._id},${sortedMembers[0].profile.name},${sortedMembers[0].auth.local.username},habit:Task 1,0,,0,todo:Task 2,0,,0`);
    expect(splitRes[2]).to.equal(`${sortedMembers[1]._id},${sortedMembers[1].profile.name},${sortedMembers[1].auth.local.username},habit:Task 1,0,,0,todo:Task 2,0,,0`);
    expect(splitRes[3]).to.equal(`${sortedMembers[2]._id},${sortedMembers[2].profile.name},${sortedMembers[2].auth.local.username},habit:Task 1,0,,0,todo:Task 2,0,,0`);
    expect(splitRes[4]).to.equal(`${sortedMembers[3]._id},${sortedMembers[3].profile.name},${sortedMembers[3].auth.local.username},habit:Task 1,0,,0,todo:Task 2,0,,0`);
    expect(splitRes[5]).to.equal('');
  });

  it('should successfully return when it contains erroneous residue user data', async () => {
    await members[0].update({ challenges: [] });
    const res = await members[1].get(`/challenges/${challenge._id}/export/csv`);
    const sortedMembers = _.sortBy([members[1], members[2], groupLeader], '_id');
    const splitRes = res.split('\n');
    expect(splitRes[0]).to.equal('UUID,Display Name,Username,Task,Value,Notes,Streak,Task,Value,Notes,Streak');
    expect(splitRes[1]).to.equal(`${sortedMembers[0]._id},${sortedMembers[0].profile.name},${sortedMembers[0].auth.local.username},habit:Task 1,0,,0,todo:Task 2,0,,0`);
    expect(splitRes[2]).to.equal(`${sortedMembers[1]._id},${sortedMembers[1].profile.name},${sortedMembers[1].auth.local.username},habit:Task 1,0,,0,todo:Task 2,0,,0`);
    expect(splitRes[3]).to.equal(`${sortedMembers[2]._id},${sortedMembers[2].profile.name},${sortedMembers[2].auth.local.username},habit:Task 1,0,,0,todo:Task 2,0,,0`);
    expect(splitRes[4]).to.equal('');
  });
});
