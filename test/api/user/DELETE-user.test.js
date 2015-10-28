import {
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('DELETE /user', () => {
  let api;

  beforeEach(() => {
    return generateUser().then((user) => {
      api = requester(user);
    });
  });

  it('deletes the user', () => {
    return expect(api.del('/user').then((fetchedUser) => {
      return api.get('/user');
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      text: 'No user found.',
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
