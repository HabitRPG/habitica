import superagent from 'superagent';
import nconf from 'nconf';
import {
  requester, generateUser,
} from '../../../helpers/api-integration/v4';

// The requester only returns `data`, so fetch the full body
async function getBody (route) {
  const res = await superagent.get(`http://localhost:${nconf.get('PORT')}/api/v4${route}`)
    .accept('application/json');
  return res.body;
}

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

  it('includes clientConfigV, matching other routes', async () => {
    const configBody = await getBody('/client-config?platform=web');
    expect(configBody.clientConfigV).to.match(/^[0-9a-f]{12}$/);
    const statusBody = await getBody('/status');
    expect(statusBody.clientConfigV).to.equal(configBody.clientConfigV);
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
    // a partial update must keep the overrides
    const iosRes = await requester().get('/client-config?platform=ios');
    expect(iosRes[key]).to.equal('ios');
  });

  it('stores "false" for boolean options as false', async () => {
    const boolKey = `testBool${Date.now()}`;
    await admin.post('/admin/client-config', {
      name: 'Test boolean option',
      key: boolKey,
      type: 'boolean',
      defaultValue: 'false',
      values: [{ platform: 'ios', value: 'true' }],
    });
    expect((await requester().get('/client-config?platform=web'))[boolKey]).to.equal(false);
    expect((await requester().get('/client-config?platform=ios'))[boolKey]).to.equal(true);
  });

  it('stores json values as formatted strings and serves them minified', async () => {
    const jsonKey = `testJson${Date.now()}`;
    const raw = '{\n  "a": [1, 2],\n  "b": { "c": true }\n}';
    const jsonOption = await admin.post('/admin/client-config', {
      name: 'Test json option',
      key: jsonKey,
      type: 'json',
      defaultValue: raw,
      values: [{ platform: 'ios', value: '[ 1,\n 2 ]' }],
    });
    expect(jsonOption.defaultValue).to.equal(raw);
    expect(jsonOption.values[0].value).to.equal('[ 1,\n 2 ]');

    const web = await requester().get('/client-config?platform=web');
    expect(web[jsonKey]).to.equal('{"a":[1,2],"b":{"c":true}}');
    const ios = await requester().get('/client-config?platform=ios');
    expect(ios[jsonKey]).to.equal('[1,2]');

    await admin.del(`/admin/client-config/${jsonOption._id}`);
  });

  it('removes disabled options', async () => {
    await admin.del(`/admin/client-config/${option._id}`);
    const res = await requester().get('/client-config?platform=web');
    expect(res[key]).to.be.undefined;
  });
});
