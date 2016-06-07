import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('GET /groups/:groupId/members', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('validates optional req.query.lastId to be an UUID', async () => {
    await expect(user.get('/groups/groupId/members?lastId=invalidUUID')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('fails if group doesn\'t exists', async () => {
    await expect(user.get(`/groups/${generateUUID()}/members`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('fails if user doesn\'t have access to the group', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let anotherUser = await generateUser();
    await expect(anotherUser.get(`/groups/${group._id}/members`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('works when passing party as req.params.groupId', async () => {
    await generateGroup(user, {type: 'party', name: generateUUID()});
    let res = await user.get('/groups/party/members');
    expect(res).to.be.an('array');
    expect(res.length).to.equal(1);
    expect(res[0]).to.eql({
      _id: user._id,
      id: user._id,
      profile: {name: user.profile.name},
    });
  });

  it('populates only some fields', async () => {
    await generateGroup(user, {type: 'party', name: generateUUID()});
    let res = await user.get('/groups/party/members');
    expect(res[0]).to.have.all.keys(['_id', 'id', 'profile']);
    expect(res[0].profile).to.have.all.keys(['name']);
  });

  it('returns only first 30 members', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});

    let usersToGenerate = [];
    for (let i = 0; i < 31; i++) {
      usersToGenerate.push(generateUser({party: {_id: group._id}}));
    }
    await Promise.all(usersToGenerate);

    let res = await user.get('/groups/party/members');
    expect(res.length).to.equal(30);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  });

  it('returns only first 30 members even when ?includeAllMembers=true', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});

    let usersToGenerate = [];
    for (let i = 0; i < 31; i++) {
      usersToGenerate.push(generateUser({party: {_id: group._id}}));
    }
    await Promise.all(usersToGenerate);

    let res = await user.get('/groups/party/members?includeAllMembers=true');
    expect(res.length).to.equal(30);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  });

  it('supports using req.query.lastId to get more members', async () => {
    let leader = await generateUser({balance: 4});
    let group = await generateGroup(leader, {type: 'guild', privacy: 'public', name: generateUUID()});

    let usersToGenerate = [];
    for (let i = 0; i < 57; i++) {
      usersToGenerate.push(generateUser({guilds: [group._id]}));
    }
    let generatedUsers = await Promise.all(usersToGenerate); // Group has 59 members (1 is the leader)
    let expectedIds = [leader._id].concat(generatedUsers.map(generatedUser => generatedUser._id));

    let res = await user.get(`/groups/${group._id}/members`);
    expect(res.length).to.equal(30);
    let res2 = await user.get(`/groups/${group._id}/members?lastId=${res[res.length - 1]._id}`);
    expect(res2.length).to.equal(28);

    let resIds = res.concat(res2).map(member => member._id);
    expect(resIds).to.eql(expectedIds.sort());
  });
});
