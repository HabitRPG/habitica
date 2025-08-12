import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  generateGroup,
  createAndPopulateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /challenges/:challengeId/members', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({ balance: 1 });
  });

  it('validates optional req.query.lastId to be an UUID', async () => {
    await expect(user.get(`/challenges/${generateUUID()}/members?lastId=invalidUUID`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('fails if challenge doesn\'t exist', async () => {
    await expect(user.get(`/challenges/${generateUUID()}/members`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('fails if user isn\'t in the private group and isn\'t challenge leader', async () => {
    const group = await generateGroup(user, { type: 'party', privacy: 'private' });
    const challenge = await generateChallenge(user, group);
    const anotherUser = await generateUser();

    await expect(anotherUser.get(`/challenges/${challenge._id}/members`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('works if user isn\'t in the private group but is challenge leader', async () => {
    const populatedGroup = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 1,
    });
    const { groupLeader } = populatedGroup;
    const challengeLeader = populatedGroup.members[0];
    const challenge = await generateChallenge(challengeLeader, populatedGroup.group);
    await groupLeader.post(`/challenges/${challenge._id}/join`);
    await challengeLeader.post('/groups/party/leave');
    await challengeLeader.sync();
    expect(challengeLeader.party._id).to.be.undefined; // check that leaving worked

    const res = await challengeLeader.get(`/challenges/${challenge._id}/members`);
    expect(res[0]).to.eql({
      _id: groupLeader._id,
      id: groupLeader._id,
      profile: { name: groupLeader.profile.name },
      auth: {
        local: {
          username: groupLeader.auth.local.username,
        },
      },
      flags: {
        verifiedUsername: true,
      },
    });
  });

  it('populates only some fields', async () => {
    const group = await generateGroup(user, { type: 'party', privacy: 'private', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);
    const res = await user.get(`/challenges/${challenge._id}/members`);
    expect(res[0]).to.eql({
      _id: user._id,
      id: user._id,
      profile: { name: user.profile.name },
      auth: {
        local: {
          username: user.auth.local.username,
        },
      },
      flags: {
        verifiedUsername: true,
      },
    });
    expect(res[0]).to.have.all.keys(['_id', 'auth', 'flags', 'id', 'profile']);
    expect(res[0].profile).to.have.all.keys(['name']);
  });

  it('returns only first 30 members if req.query.limit is undefined', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);

    const usersToGenerate = [];
    for (let i = 0; i < 31; i += 1) {
      usersToGenerate.push(generateUser({ challenges: [challenge._id] }));
    }
    await Promise.all(usersToGenerate);

    const res = await user.get(`/challenges/${challenge._id}/members`);
    expect(res.length).to.equal(30);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'auth', 'flags', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  });

  it('returns an error if req.query.limit is over 60', async () => {
    const group = await generateGroup(user, { type: 'party', privacy: 'private' });
    const challenge = await generateChallenge(user, group);
    const anotherUser = await generateUser();

    await expect(anotherUser.get(`/challenges/${challenge._id}/members?limit=61`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns an error if req.query.limit is under 1', async () => {
    const group = await generateGroup(user, { type: 'party', privacy: 'private' });
    const challenge = await generateChallenge(user, group);
    const anotherUser = await generateUser();

    await expect(anotherUser.get(`/challenges/${challenge._id}/members?limit=-13`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns an error if req.query.limit is not an integer', async () => {
    const group = await generateGroup(user, { type: 'party', privacy: 'private' });
    const challenge = await generateChallenge(user, group);
    const anotherUser = await generateUser();

    await expect(anotherUser.get(`/challenges/${challenge._id}/members?limit=true`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns up to 60 members when req.query.limit is specified', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);

    const usersToGenerate = [];
    for (let i = 0; i < 62; i += 1) {
      usersToGenerate.push(generateUser({ challenges: [challenge._id] }));
    }
    await Promise.all(usersToGenerate);

    let res = await user.get(`/challenges/${challenge._id}/members?limit=57`);
    expect(res.length).to.equal(57);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'auth', 'flags', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });

    res = await user.get(`/challenges/${challenge._id}/members?limit=60&lastId=${res[res.length - 1]._id}`);
    expect(res.length).to.equal(6);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'auth', 'flags', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  }).timeout(30000);

  it('supports using req.query.lastId to get more members', async function test () {
    this.timeout(30000); // @TODO: times out after 8 seconds
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);

    const usersToGenerate = [];
    for (let i = 0; i < 57; i += 1) {
      usersToGenerate.push(generateUser({ challenges: [challenge._id] }));
    }
    // Group has 59 members (1 is the leader)
    const generatedUsers = await Promise.all(usersToGenerate);
    const expectedIds = [user._id].concat(generatedUsers.map(generatedUser => generatedUser._id));

    const res = await user.get(`/challenges/${challenge._id}/members`);
    expect(res.length).to.equal(30);
    const res2 = await user.get(`/challenges/${challenge._id}/members?lastId=${res[res.length - 1]._id}`);
    expect(res2.length).to.equal(28);

    const resIds = res.concat(res2).map(member => member._id);
    expect(resIds).to.eql(expectedIds.sort());
  });

  it('supports using req.query.includeTasks in order to add challenge-related tasks of all members', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);

    const usersToGenerate = [];
    for (let i = 0; i < 8; i += 1) {
      usersToGenerate.push(generateUser({ challenges: [challenge._id] }));
    }
    await Promise.all(usersToGenerate);
    await user.post(`/tasks/challenge/${challenge._id}`, [{ type: 'habit', text: 'Some task' }]);
    await user.post(`/tasks/challenge/${challenge._id}`, [{ type: 'daily', text: 'Some different task' }]);

    const res = await user.get(`/challenges/${challenge._id}/members?includeTasks=true`);
    expect(res.length).to.equal(9);
    res.forEach(member => {
      expect(member).to.have.property('tasks');
      expect(member.tasks).to.be.an('array');
      expect(member.tasks).to.have.lengthOf(2);
      member.tasks.forEach(task => {
        expect(task).to.include.all.keys(['type', 'value', 'priority', 'text', '_id', 'userId']);
        expect(task).to.not.have.any.keys(['tags', 'checklist']);
        expect(task.challenge.id).to.be.equal(challenge._id);
        expect(task.userId).to.be.equal(member._id);
      });
    });
  });

  it('supports using req.query.search to get search members', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const challenge = await generateChallenge(user, group);
    await user.post(`/challenges/${challenge._id}/join`);

    const usersToGenerate = [];
    for (let i = 0; i < 3; i += 1) {
      usersToGenerate.push(generateUser({
        challenges: [challenge._id],
        'auth.local.username': `${i}username`,
      }));
    }
    const generatedUsers = await Promise.all(usersToGenerate);
    const usernames = generatedUsers.map(generatedUser => generatedUser.auth.local.username);

    const firstUsername = usernames[0];
    const nameToSearch = firstUsername.substring(0, 4);

    const response = await user.get(`/challenges/${challenge._id}/members?search=${nameToSearch}`);
    expect(response[0].auth.local.username).to.eql(firstUsername);
  });
});
