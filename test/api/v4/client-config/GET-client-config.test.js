import {
  requester, generateUser,
} from '../../../helpers/api-integration/v4';

describe('GET /client-config', () => {
  let admin;
  let option;
  const key = `testKey${Date.now()}`;

  before(async () => {
    admin = await generateUser({
      'permissions.clientConfig': true,
    });
    option = await admin.post('/admin/client-config', {
      name: 'Test option',
      key,
      type: 'text',
      defaultValue: 'default',
      values: [
        { platform: 'ios', value: 'ios' },
        { platform: 'mobile', value: 'mobile' },
      ],
    });
  });

  it('does not require authentication and resolves the web value', async () => {
    const res = await requester().get('/client-config?platform=web');
    expect(res[key]).to.equal('default');
  });

  it('prefers a platform specific override over mobile', async () => {
    const res = await requester().get('/client-config?platform=ios');
    expect(res[key]).to.equal('ios');
  });

  it('falls back to the mobile override', async () => {
    const res = await requester().get('/client-config?platform=android');
    expect(res[key]).to.equal('mobile');
  });

  it('uses the x-client header when no platform is passed', async () => {
    const res = await requester({}, { 'x-client': 'habitica-android' }).get('/client-config');
    expect(res[key]).to.equal('mobile');
  });

  it('reflects updates immediately', async () => {
    await admin.put(`/admin/client-config/${option._id}`, { defaultValue: 'updated' });
    const res = await requester().get('/client-config?platform=web');
    expect(res[key]).to.equal('updated');
  });

  it('removes disabled options', async () => {
    await admin.del(`/admin/client-config/${option._id}`);
    const res = await requester().get('/client-config?platform=web');
    expect(res[key]).to.be.undefined;
  });
});
