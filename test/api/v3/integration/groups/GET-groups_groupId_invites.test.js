import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('GET /groups/:groupId/invites', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('validates optional req.query.lastId to be an UUID', async () => {
    await expect(user.get('/groups/groupId/invites?lastId=invalidUUID')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('fails if group doesn\'t exists', async () => {
    await expect(user.get(`/groups/${generateUUID()}/invites`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('fails if user doesn\'t have access to the group', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let anotherUser = await generateUser();
    await expect(anotherUser.get(`/groups/${group._id}/invites`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('works when passing party as req.params.groupId', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let invited = await generateUser();
    await user.post(`/groups/${group._id}/invite`, {uuids: [invited._id]});
    let res = await user.get('/groups/party/invites');

    expect(res).to.be.an('array');
    expect(res.length).to.equal(1);
    expect(res[0]).to.eql({
      _id: invited._id,
      id: invited._id,
      profile: {name: invited.profile.name},
    });
  });

  it('populates only some fields', async () => {
    let group = await generateGroup(user, {type: 'party', name: generateUUID()});
    let invited = await generateUser();
    await user.post(`/groups/${group._id}/invite`, {uuids: [invited._id]});
    let res = await user.get('/groups/party/invites');
    expect(res[0]).to.have.all.keys(['_id', 'id', 'profile']);
    expect(res[0].profile).to.have.all.keys(['name']);
  });

  it('returns only first 30 invites', async () => {
    let leader = await generateUser({balance: 4});
    let group = await generateGroup(leader, {type: 'guild', privacy: 'public', name: generateUUID()});

    let invitesToGenerate = [];
    for (let i = 0; i < 31; i++) {
      invitesToGenerate.push(generateUser());
    }
    let generatedInvites = await Promise.all(invitesToGenerate);
    await leader.post(`/groups/${group._id}/invite`, {uuids: generatedInvites.map(invite => invite._id)});

    let res = await leader.get(`/groups/${group._id}/invites`);
    expect(res.length).to.equal(30);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  });

  it('supports using req.query.lastId to get more invites', async () => {
    let leader = await generateUser({balance: 4});
    let group = await generateGroup(leader, {type: 'guild', privacy: 'public', name: generateUUID()});

    let invitesToGenerate = [];
    for (let i = 0; i < 32; i++) {
      invitesToGenerate.push(generateUser());
    }
    let generatedInvites = await Promise.all(invitesToGenerate); // Group has 32 invites
    let expectedIds = generatedInvites.map(generatedInvite => generatedInvite._id);
    await user.post(`/groups/${group._id}/invite`, {uuids: expectedIds});

    let res = await user.get(`/groups/${group._id}/invites`);
    expect(res.length).to.equal(30);
    let res2 = await user.get(`/groups/${group._id}/invites?lastId=${res[res.length - 1]._id}`);
    expect(res2.length).to.equal(2);

    let resIds = res.concat(res2).map(invite => invite._id);
    expect(resIds).to.eql(expectedIds.sort());
  });
});
