import {
  generateUser,
  requester,
} from '../../../helpers/api-integration.helper';

describe('GET /user', () => {
  let user;

  before(() => {
    return generateUser().then((usr) => {
      let api = requester(usr);
      return api.get('/user');
    }).then((fetchedUser) => {
      user = fetchedUser;
    });
  });

  it('gets the user object', () => {
    expect(user._id).to.eql(user._id);
    expect(user.auth.local.username).to.eql(user.auth.local.username);
    expect(user.todos).to.eql(user.todos);
    expect(user.items).to.eql(user.items);
  });

  it('does not include password information', () => {
    expect(user.auth.local.hashed_password).to.not.exist
    expect(user.auth.local.salt).to.not.exist
  });

  it('does not include api token', () => {
    expect(user.apiToken).to.not.exist
  });
});
