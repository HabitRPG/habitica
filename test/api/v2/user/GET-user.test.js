import {
  generateUser,
} from '../../../helpers/api-integration/v2';

describe('GET /user', () => {
  let user;

  before(async () => {
    let usr = await generateUser();
    user = await usr.get('/user');
  });

  it('gets the user object', async () => {
    expect(user._id).to.eql(user._id);
    expect(user.auth.local.username).to.eql(user.auth.local.username);
    expect(user.todos).to.eql(user.todos);
    expect(user.items).to.eql(user.items);
  });

  it('does not include password information', async () => {
    expect(user.auth.local.hashed_password).to.not.exist;
    expect(user.auth.local.salt).to.not.exist;
  });

  it('does not include api token', async () => {
    expect(user.apiToken).to.not.exist;
  });
});
