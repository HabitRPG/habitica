import superagent from 'superagent';
import nconf from 'nconf';
import { v4 as generateUUID } from 'uuid';
import {
  requester, generateUser, translate as t,
} from '../../../helpers/api-integration/v4';

// The requester only returns `data`, so fetch the full body
async function getClientConfigV () {
  const res = await superagent.get(`http://localhost:${nconf.get('PORT')}/api/v4/client-config?platform=web`)
    .accept('application/json');
  return res.body.clientConfigV;
}

describe('client config admin edge cases', () => {
  let admin;
  const keySuffix = Date.now();
  const created = [];

  async function createOption (body) {
    const option = await admin.post('/admin/client-config', {
      name: 'Edge case option',
      ...body,
    });
    created.push(option._id);
    return option;
  }

  before(async () => {
    admin = await generateUser({ 'permissions.clientConfig': true });
  });

  after(async () => {
    await Promise.all(created.map(id => admin.del(`/admin/client-config/${id}`).catch(() => {})));
  });

  it('requires the clientConfig permission', async () => {
    const user = await generateUser();
    await expect(user.get('/admin/client-config'))
      .to.eventually.be.rejected.and.have.property('code', 401);
    await expect(user.post('/admin/client-config', {
      name: 'x', key: `noPerm${keySuffix}`, type: 'text', defaultValue: 'x',
    })).to.eventually.be.rejected.and.have.property('code', 401);
    await expect(user.post('/admin/client-config-segments', { name: 'x', conditions: [] }))
      .to.eventually.be.rejected.and.have.property('code', 401);
  });

  it('ignores an _id passed in the body', async () => {
    const _id = generateUUID();
    const option = await createOption({
      _id, key: `bodyId${keySuffix}`, type: 'text', defaultValue: 'x',
    });
    expect(option._id).to.not.equal(_id);

    const segment = await admin.post('/admin/client-config-segments', { _id, name: 'x', conditions: [] });
    expect(segment._id).to.not.equal(_id);
    await admin.del(`/admin/client-config-segments/${segment._id}`);
  });

  it('rejects blank or non-numeric numbers', async () => {
    await expect(createOption({ key: `nan${keySuffix}`, type: 'number', defaultValue: 'abc' }))
      .to.eventually.be.rejected.and.have.property('code', 400);
    await expect(createOption({ key: `blank${keySuffix}`, type: 'number', defaultValue: '' }))
      .to.eventually.be.rejected.and.have.property('code', 400);
  });

  it('rejects invalid json', async () => {
    await expect(createOption({ key: `badJson${keySuffix}`, type: 'json', defaultValue: '{ nope' }))
      .to.eventually.be.rejected.and.have.property('code', 400);
  });

  it('rejects a duplicate key', async () => {
    const key = `dup${keySuffix}`;
    const error = { code: 400, error: 'BadRequest', message: t('clientConfigKeyInUse', { key }) };
    await createOption({ key, type: 'text', defaultValue: 'x' });
    await expect(createOption({ key, type: 'text', defaultValue: 'y' }))
      .to.eventually.be.rejected.and.eql(error);

    const other = await createOption({ key: `dupOther${keySuffix}`, type: 'text', defaultValue: 'z' });
    await expect(admin.put(`/admin/client-config/${other._id}`, { key }))
      .to.eventually.be.rejected.and.eql(error);
  });

  it('coerces partial updates using the stored type', async () => {
    const numberKey = `partialNumber${keySuffix}`;
    const number = await createOption({ key: numberKey, type: 'number', defaultValue: 1 });
    await admin.put(`/admin/client-config/${number._id}`, { defaultValue: '5' });

    const boolKey = `partialBool${keySuffix}`;
    const bool = await createOption({ key: boolKey, type: 'boolean', defaultValue: true });
    await admin.put(`/admin/client-config/${bool._id}`, {
      values: [{ platform: 'web', value: 'false' }],
    });

    const res = await requester().get('/client-config?platform=web');
    expect(res[numberKey]).to.equal(5);
    expect(res[boolKey]).to.equal(false);
  });

  it('re-coerces stored values when only the type changes', async () => {
    const key = `typeChange${keySuffix}`;
    const option = await createOption({
      key, type: 'text', defaultValue: '7', values: [{ platform: 'web', value: '8' }],
    });
    await admin.put(`/admin/client-config/${option._id}`, { type: 'number' });
    expect((await requester().get('/client-config?platform=web'))[key]).to.equal(8);
    expect((await requester().get('/client-config?platform=ios'))[key]).to.equal(7);

    // values that can't be converted are rejected instead of stored as NaN
    const textOption = await createOption({ key: `typeChangeBad${keySuffix}`, type: 'text', defaultValue: 'abc' });
    await expect(admin.put(`/admin/client-config/${textOption._id}`, { type: 'number' }))
      .to.eventually.be.rejected.and.have.property('code', 400);
  });

  it('returns 404 for unknown ids and 400 for invalid ids', async () => {
    await expect(admin.put(`/admin/client-config/${generateUUID()}`, { defaultValue: 'x' }))
      .to.eventually.be.rejected.and.have.property('code', 404);
    await expect(admin.del(`/admin/client-config/${generateUUID()}`))
      .to.eventually.be.rejected.and.have.property('code', 404);
    await expect(admin.del('/admin/client-config/not-a-uuid'))
      .to.eventually.be.rejected.and.have.property('code', 400);
    await expect(admin.del(`/admin/client-config-segments/${generateUUID()}`))
      .to.eventually.be.rejected.and.have.property('code', 404);
  });

  it('rejects segments with a blank number condition', async () => {
    await expect(admin.post('/admin/client-config-segments', {
      name: 'Blank level',
      conditions: [{ attribute: 'level', operator: 'gte', value: '' }],
    })).to.eventually.be.rejected.and.have.property('code', 400);
  });

  it('targets non-subscribers with "subscriber eq false"', async () => {
    const segment = await admin.post('/admin/client-config-segments', {
      name: 'Free users',
      conditions: [{ attribute: 'subscriber', operator: 'eq', value: 'false' }],
    });
    const key = `freeUsers${keySuffix}`;
    const option = await createOption({
      key, type: 'text', defaultValue: 'default', values: [{ segment: segment._id, value: 'free' }],
    });

    const user = await generateUser();
    expect((await user.get('/client-config?platform=web'))[key]).to.equal('free');

    await admin.del(`/admin/client-config/${option._id}`);
    await admin.del(`/admin/client-config-segments/${segment._id}`);
  });

  describe('clientConfigV', () => {
    let option;

    before(async () => {
      option = await createOption({ key: `version${keySuffix}`, type: 'text', defaultValue: 'a' });
    });

    it('does not change when only the name or description changes', async () => {
      const before = await getClientConfigV();
      await admin.put(`/admin/client-config/${option._id}`, { name: 'Renamed', description: 'New' });
      expect(await getClientConfigV()).to.equal(before);
    });

    it('changes when a value changes', async () => {
      const before = await getClientConfigV();
      await admin.put(`/admin/client-config/${option._id}`, { defaultValue: 'b' });
      expect(await getClientConfigV()).to.not.equal(before);
    });

    it('changes when an option is disabled and returns when it is re-enabled', async () => {
      const enabled = await getClientConfigV();
      await admin.put(`/admin/client-config/${option._id}`, { enabled: false });
      expect(await getClientConfigV()).to.not.equal(enabled);
      await admin.put(`/admin/client-config/${option._id}`, { enabled: true });
      expect(await getClientConfigV()).to.equal(enabled);
    });

    it('does not change when a segment nobody references changes', async () => {
      const segment = await admin.post('/admin/client-config-segments', { name: 'Unused', conditions: [] });
      const before = await getClientConfigV();
      await admin.put(`/admin/client-config-segments/${segment._id}`, {
        conditions: [{ attribute: 'level', operator: 'gte', value: 5 }],
      });
      expect(await getClientConfigV()).to.equal(before);
      await admin.del(`/admin/client-config-segments/${segment._id}`);
    });
  });
});
