import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  requester,
  getProperty,
} from '../../../../../helpers/api-integration/v3';
import * as appleAuth from '../../../../../../website/server/libs/auth/apple';

describe('GET /user/auth/apple', () => {
  let api;
  let user;
  const appleEndpoint = '/user/auth/apple';
  let randomAppleId = '123456';

  beforeEach(async () => {
    api = requester();
    user = await generateUser();
    randomAppleId = generateUUID();
    const expectedResult = { id: randomAppleId, name: 'an apple user' };
    sandbox.stub(appleAuth, 'appleProfile').returns(Promise.resolve(expectedResult));
  });

  afterEach(async () => {
    appleAuth.appleProfile.restore();
  });

  it('registers a new user', async () => {
    const response = await api.get(appleEndpoint);

    expect(response.apiToken).to.exist;
    expect(response.id).to.exist;
    expect(response.newUser).to.be.true;
    await expect(getProperty('users', response.id, 'auth.apple.id')).to.eventually.equal(randomAppleId);
    await expect(getProperty('users', response.id, 'profile.name')).to.eventually.equal('an apple user');
  });

  it('logs an existing user in', async () => {
    const registerResponse = await api.get(appleEndpoint);

    const response = await api.get(appleEndpoint);

    expect(response.apiToken).to.eql(registerResponse.apiToken);
    expect(response.id).to.eql(registerResponse.id);
    expect(response.newUser).to.be.false;
  });

  it('add social auth to an existing user', async () => {
    const response = await user.get(appleEndpoint);

    expect(response.apiToken).to.exist;
    expect(response.id).to.exist;
    expect(response.newUser).to.be.false;
  });
});
