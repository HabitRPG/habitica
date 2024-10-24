import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  generateGroup,
  translate as t,
  createAndPopulateGroup,
} from '../../../../helpers/api-integration/v3';

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
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const anotherUser = await generateUser();
    await expect(anotherUser.get(`/groups/${group._id}/invites`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('works when passing party as req.params.groupId', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const invited = await generateUser();
    await user.post(`/groups/${group._id}/invite`, { uuids: [invited._id] });
    const res = await user.get('/groups/party/invites');

    expect(res).to.be.an('array');
    expect(res.length).to.equal(1);
    expect(res[0]).to.eql({
      _id: invited._id,
      id: invited._id,
      profile: { name: invited.profile.name },
      auth: {
        local: {
          username: invited.auth.local.username,
        },
      },
      flags: {
        verifiedUsername: true,
      },
    });
  });

  it('populates only some fields', async () => {
    const group = await generateGroup(user, { type: 'party', name: generateUUID() });
    const invited = await generateUser();
    await user.post(`/groups/${group._id}/invite`, { uuids: [invited._id] });
    const res = await user.get('/groups/party/invites');
    expect(res[0]).to.have.all.keys(['_id', 'auth', 'flags', 'id', 'profile']);
    expect(res[0].profile).to.have.all.keys(['name']);
  });

  it('returns only first 30 invites by default (req.query.limit not specified)', async () => {
    const { group, groupLeader: leader } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'private',
        name: generateUUID(),
      },
      leaderDetails: { balance: 4 },
      invites: 31,
      upgradeToGroupPlan: true,
    });

    const res = await leader.get(`/groups/${group._id}/invites`);
    expect(res.length).to.equal(30);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'auth', 'flags', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  }).timeout(10000);

  it('returns an error if req.query.limit is over 60', async () => {
    const { group, groupLeader: leader } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'private',
        name: generateUUID(),
      },
      leaderDetails: { balance: 4 },
      invites: 1,
      upgradeToGroupPlan: true,
    });

    await expect(leader.get(`/groups/${group._id}/invites?limit=61`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns an error if req.query.limit is under 1', async () => {
    const { group, groupLeader: leader } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'private',
        name: generateUUID(),
      },
      leaderDetails: { balance: 4 },
      invites: 1,
      upgradeToGroupPlan: true,
    });

    await expect(leader.get(`/groups/${group._id}/invites?limit=-1`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns an error if req.query.limit is not an integer', async () => {
    const { group, groupLeader: leader } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'private',
        name: generateUUID(),
      },
      leaderDetails: { balance: 4 },
      invites: 1,
      upgradeToGroupPlan: true,
    });

    await expect(leader.get(`/groups/${group._id}/invites?limit=1.3`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns up to 60 invites when req.query.limit is specified', async () => {
    const { group, groupLeader: leader } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'private',
        name: generateUUID(),
      },
      leaderDetails: { balance: 4 },
      invites: 31,
      upgradeToGroupPlan: true,
    });

    let res = await leader.get(`/groups/${group._id}/invites?limit=14`);
    expect(res.length).to.equal(14);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'auth', 'flags', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });

    res = await leader.get(`/groups/${group._id}/invites?limit=31`);
    expect(res.length).to.equal(31);
    res.forEach(member => {
      expect(member).to.have.all.keys(['_id', 'auth', 'flags', 'id', 'profile']);
      expect(member.profile).to.have.all.keys(['name']);
    });
  }).timeout(30000);

  it('supports using req.query.lastId to get more invites', async function test () {
    let group; let invitees;
    this.timeout(30000); // @TODO: times out after 8 seconds
    ({ group, groupLeader: user, invitees } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'private',
        name: generateUUID(),
      },
      leaderDetails: { balance: 4 },
      invites: 32,
      upgradeToGroupPlan: true,
    }));

    const expectedIds = invitees.map(generatedInvite => generatedInvite._id);

    const res = await user.get(`/groups/${group._id}/invites`);
    expect(res.length).to.equal(30);
    const res2 = await user.get(`/groups/${group._id}/invites?lastId=${res[res.length - 1]._id}`);
    expect(res2.length).to.equal(2);

    const resIds = res.concat(res2).map(invite => invite._id);
    expect(resIds).to.eql(expectedIds.sort());
  });
});
