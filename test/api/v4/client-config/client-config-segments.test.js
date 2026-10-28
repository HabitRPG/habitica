import { v4 as generateUUID } from 'uuid';
import {
  requester, generateUser, translate as t,
} from '../../../helpers/api-integration/v4';

describe('client config segments', () => {
  let admin;
  let segment;
  let option;
  const key = `testSegmentKey${Date.now()}`;

  before(async () => {
    admin = await generateUser({
      'permissions.clientConfig': true,
    });
    segment = await admin.post('/admin/client-config-segments', {
      name: 'High level',
      conditions: [{ attribute: 'level', operator: 'gte', value: '10' }],
    });
    option = await admin.post('/admin/client-config', {
      name: 'Segment test option',
      key,
      type: 'text',
      defaultValue: 'default',
      values: [
        { platform: 'ios', value: 'ios' },
        { segment: segment._id, value: 'segment' },
        { segment: segment._id, platform: 'android', value: 'segmentAndroid' },
      ],
    });
  });

  after(async () => {
    await admin.del(`/admin/client-config/${option._id}`);
    await admin.del(`/admin/client-config-segments/${segment._id}`);
  });

  it('coerces condition values', async () => {
    expect(segment.conditions[0].value).to.equal(10);
  });

  it('lists attributes', async () => {
    const attributes = await admin.get('/admin/client-config-attributes');
    expect(attributes.find(a => a.key === 'level')).to.eql({
      key: 'level', name: 'Level', type: 'number', operators: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte'],
    });
  });

  it('rejects invalid conditions', async () => {
    await expect(admin.post('/admin/client-config-segments', {
      name: 'Invalid',
      conditions: [{ attribute: 'apiToken', operator: 'eq', value: 'x' }],
    })).to.eventually.be.rejected.and.have.property('code', 400);
  });

  it('rejects options targeting unknown segments', async () => {
    await expect(admin.post('/admin/client-config', {
      name: 'Unknown segment',
      key: `unknownSegment${Date.now()}`,
      type: 'text',
      defaultValue: 'default',
      values: [{ segment: generateUUID(), value: 'x' }],
    })).to.eventually.be.rejected.and.have.property('code', 400);
  });

  it('does not delete segments that are in use', async () => {
    await expect(admin.del(`/admin/client-config-segments/${segment._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('segmentInUse', { key }),
      });
  });

  it('returns the untargeted value to anonymous requests', async () => {
    const res = await requester().get('/client-config?platform=web');
    expect(res[key]).to.equal('default');
  });

  it('returns the segment value to matching users', async () => {
    const user = await generateUser({ 'stats.lvl': 20 });
    expect((await user.get('/client-config?platform=web'))[key]).to.equal('segment');
    // segment overrides beat platform-only overrides
    expect((await user.get('/client-config?platform=ios'))[key]).to.equal('segment');
    expect((await user.get('/client-config?platform=android'))[key]).to.equal('segmentAndroid');
  });

  it('does not return the segment value to other users', async () => {
    const user = await generateUser({ 'stats.lvl': 2 });
    expect((await user.get('/client-config?platform=web'))[key]).to.equal('default');
    expect((await user.get('/client-config?platform=ios'))[key]).to.equal('ios');
  });

  it('falls back to the untargeted config for invalid credentials', async () => {
    const user = await generateUser({ 'stats.lvl': 20 });
    const res = await requester({ _id: user._id, apiToken: generateUUID() })
      .get('/client-config?platform=web');
    expect(res[key]).to.equal('default');
  });

  it('ignores disabled segments', async () => {
    const user = await generateUser({ 'stats.lvl': 20 });
    await admin.put(`/admin/client-config-segments/${segment._id}`, { enabled: false });
    expect((await user.get('/client-config?platform=web'))[key]).to.equal('default');
    await admin.put(`/admin/client-config-segments/${segment._id}`, { enabled: true });
  });
});
