import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';
import common from '../../../../../website/common';

describe('GET /groups/:groupId/members', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      balance: 10,
      contributor: {level: 1},
      backer: {tier: 3},
      preferences: {
        costume: false,
        background: 'volcano',
      },
    });
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

  it('req.query.includeAllPublicFields === true only works with parties', async () => {
    let group = await generateGroup(user, {type: 'guild', name: generateUUID()});
    let res = await user.get(`/groups/${group._id}/members?includeAllPublicFields=true`);
    expect(res[0]).to.have.all.keys(['_id', 'id', 'profile']);
    expect(res[0].profile).to.have.all.keys(['name']);
  });

  it('populates all public fields if req.query.includeAllPublicFields === true and it is a party', async () => {
    await generateGroup(user, {type: 'party', name: generateUUID()});
    let [memberRes] = await user.get('/groups/party/members?includeAllPublicFields=true');

    expect(memberRes).to.have.all.keys([ // works as: object has all and only these keys
      '_id', 'id', 'preferences', 'profile', 'stats', 'achievements', 'party',
      'backer', 'contributor', 'auth', 'items', 'inbox',
    ]);
    expect(Object.keys(memberRes.auth)).to.eql(['timestamps']);
    expect(Object.keys(memberRes.preferences).sort()).to.eql(['size', 'hair', 'skin', 'shirt',
      'chair', 'costume', 'sleep', 'background'].sort());

    expect(memberRes.stats.maxMP).to.exist;
    expect(memberRes.stats.maxHealth).to.equal(common.maxHealth);
    expect(memberRes.stats.toNextLevel).to.equal(common.tnl(memberRes.stats.lvl));
    expect(memberRes.inbox.optOut).to.exist;
    expect(memberRes.inbox.messages).to.not.exist;
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
