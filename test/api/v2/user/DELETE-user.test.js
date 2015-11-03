import {
  checkExistence,
  generateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration.helper';

describe('DELETE /user', () => {
  let api, user;

  beforeEach(() => {
    return generateUser().then((usr) => {
      api = requester(usr);
      user = usr;
    });
  });

  it('deletes the user', () => {
    return expect(api.del('/user').then((fetchedUser) => {
      return checkExistence('users', user._id);
    })).to.eventually.eql(false);
  });

  context('user has active subscription', () => {
    it('does not delete account');
  });

  context('last member of a party', () => {
    let party;

    beforeEach(() => {
      return generateGroup(user, {
        type: 'party',
        privacy: 'private'
      }).then((group) => {
        party = group;
      });
    });

    it('deletes party when user is the only member', () => {
    return expect(api.del('/user').then((result) => {
        return checkExistence('groups', party._id);
      })).to.eventually.eql(false);
    });
  });

  context('last member of a private guild', () => {
    let guild;

    beforeEach(() => {
      return generateGroup(user, {
        type: 'guild',
        privacy: 'private'
      }).then((group) => {
        guild = group;
      });
    });

    it('deletes guild when user is the only member', () => {
    return expect(api.del('/user').then((result) => {
        return checkExistence('groups', guild._id);
      })).to.eventually.eql(false);
    });
  });

  context('groups with multiple members', () => {
    it('removes user from all groups user was a part of');

    it('chooses new group leader for any group user was the leader of');
  });

  context('pending invitation to group', () => {
    it('removes invitations from groups');
  });
});
