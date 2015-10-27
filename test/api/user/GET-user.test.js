import {
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('GET /user', () => {
  let user;

  beforeEach(() => {
    return generateUser().then((usr) => {
      user = usr;
    });
  });

  it('gets the user object', () => {
    let api = requester(user);
    return api.get('/user').then((fetchedUser) => {
      expect(fetchedUser._id).to.eql(user._id);
      expect(fetchedUser.auth.local.username).to.eql(user.auth.local.username);
      expect(fetchedUser.todos).to.eql(user.todos);
      expect(fetchedUser.items).to.eql(user.items);
    });
  });
});
