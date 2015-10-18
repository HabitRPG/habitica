import {
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('DELETE /user', () => {
  let api;

  beforeEach((done) => {
    generateUser().then((usr) => {
      api = requester(usr);
      done();
    }).catch(done);
  });

  it('deletes the user', (done) => {
    api.del('/user')
      .then((fetchedUser) => {
        return api.get('/user')
      })
      .then((deletedUser) => {
        done('Unexpected user');
      })
      .catch((err) => {
        expect(err.response.status).to.eql(401);
        done();
      });
  });
});
