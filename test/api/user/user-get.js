import {
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('GET /user', () => {
  let api, user;

  beforeEach((done) => {
    api = requester();
    generateUser().then((usr) => {
      user = usr;
      api = requester(usr);
      done();
    }).catch(done);
  });

  it('gets the user object', (done) => {
    api.get('/user')
      .then((fetchedUser) => {
        expect(fetchedUser._id).to.eql(user._id);
        expect(fetchedUser.todos).to.eql(user.todos);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
