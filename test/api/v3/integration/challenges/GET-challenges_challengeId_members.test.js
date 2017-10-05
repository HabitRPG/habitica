import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('GET /challenges/:challengeId/members', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('validates optional req.query.lastId to be an UUID', async () => {
    await expect(user.get(`/challenges/${generateUUID()}/members?lastId=invalidUUID`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('fails if challenge doesn\'t exists', async () => {
    await expect(user.get(`/challenges/${generateUUID()}/members`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('fails if user doesn\'t have access to the challenge', async () => {
    let group = await generateGroup(user);
    let challenge = await generateChallenge(user, group);
    let anotherUser = await generateUser();

    await expect(anotherUser.get(`/challenges/${challenge._id}/members`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('works with challenges belonging to public guild', async () => {
    let leader = await generateUser({balance: 4});
    let group = await generateGroup(leader, {type: 'guild', privacy: 'public', name: generateUUID()});
    let challenge = await generateChallenge(leader, group);
    let res = await user.get(`/challenges/${challenge._id}/members`);
    expect(res[0]).to.eql({
      _id: leader._id,
      id: leader._id,
      profile: {name: leader.profile.name},
    });
    expect(res[0]).to.have.all.keys(['_id', 'id', 'profile']);
    expect(res[0].profile).to.have.all.keys(['name']);
  });

  it('populates only some fields', async () => {
    let anotherUser = await generateUser({balance: 3});
    let group = await generateGroup(anotherUser, {type: 'guild', privacy: 'public', name: generateUUID()});
    let challenge = await generateChallenge(anotherUser, group);
    let res = await user.get(`/challenges/${challenge._id}/members`);
    expect(res[0]).to.eql({
      _id: anotherUser._id,
      id: anotherUser._id,
      profile: {name: anotherUser.profile.name},
    });
    expect(res[0]).to.have.all.keys(['_id', 'id', 'profile']);
    expect(res[0].profile).to.have.all.keys(['name']);
  });

  it('returns only first 30 members if req.query.includeAllMembers is not true', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let challenge = await generateChallenge(user, group);

    let usersToGenerate = [];
    for (let i = 0; i < 31; i++) {
      usersToGenerate.push(generateUser({challenges: [challenge._id]}));
    }
    await Promise.all(usersToGenerate);

    let res = await user.get(`/challenges/${challenge._id}/members?includeAllMembers=not-true`);
    expect(res.length).to.equal(30);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  });

  it('returns only first 30 members if req.query.includeAllMembers is not defined', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let challenge = await generateChallenge(user, group);

    let usersToGenerate = [];
    for (let i = 0; i < 31; i++) {
      usersToGenerate.push(generateUser({challenges: [challenge._id]}));
    }
    await Promise.all(usersToGenerate);

    let res = await user.get(`/challenges/${challenge._id}/members`);
    expect(res.length).to.equal(30);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  });

  it('returns all members if req.query.includeAllMembers is true', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let challenge = await generateChallenge(user, group);

    let usersToGenerate = [];
    for (let i = 0; i < 31; i++) {
      usersToGenerate.push(generateUser({challenges: [challenge._id]}));
    }
    await Promise.all(usersToGenerate);

    let res = await user.get(`/challenges/${challenge._id}/members?includeAllMembers=true`);
    expect(res.length).to.equal(32);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  });

  it('supports using req.query.lastId to get more members', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let challenge = await generateChallenge(user, group);

    let usersToGenerate = [];
    for (let i = 0; i < 57; i++) {
      usersToGenerate.push(generateUser({challenges: [challenge._id]}));
    }
    let generatedUsers = await Promise.all(usersToGenerate); // Group has 59 members (1 is the leader)
    let expectedIds = [user._id].concat(generatedUsers.map(generatedUser => generatedUser._id));

    let res = await user.get(`/challenges/${challenge._id}/members`);
    expect(res.length).to.equal(30);
    let res2 = await user.get(`/challenges/${challenge._id}/members?lastId=${res[res.length - 1]._id}`);
    expect(res2.length).to.equal(28);

    let resIds = res.concat(res2).map(member => member._id);
    expect(resIds).to.eql(expectedIds.sort());
  });

  it('supports using req.query.search to get search members', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let challenge = await generateChallenge(user, group);

    let usersToGenerate = [];
    for (let i = 0; i < 3; i++) {
      usersToGenerate.push(generateUser({challenges: [challenge._id]}));
    }
    let generatedUsers = await Promise.all(usersToGenerate);
    let profileNames = generatedUsers.map(generatedUser => generatedUser.profile.name);

    let firstProfileName = profileNames[0];
    let nameToSearch = firstProfileName.substring(0, 4);

    let response = await user.get(`/challenges/${challenge._id}/members?search=${nameToSearch}`);
    expect(response[0].profile.name).to.eql(firstProfileName);
  });
});
