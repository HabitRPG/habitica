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

  context('user in solo group', () => {

    it('deletes party when user is the only member');

    it('deletes private guild when user is the only member');
  });

  context('user in group with members', () => {

    it('removes user from all groups user was a part of');

    it('chooses new group leader for any group user was the leader of');

    it('removes invitations from groups');
  });
});
