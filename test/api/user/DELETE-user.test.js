import {
  checkExistence,
  generateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../helpers/api.helper';

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
      return api.get('/user');
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      text: t('messageAuthNoUserFound'),
    });
  });

  context('user has active subscription', () => {
    it('does not delete account');
  });

  context('user in', () => {
    
    context('solo group', () => {
      let group;
      
      beforeEach(() => {
        return generateGroup(user, {
          type: 'party',
          privacy: 'private'
        })
        .then((grp) => {
          group = grp;
        });
      });
      
      it('deletes party when user is the only member', () => {
      return expect(api.del('/user').then((duser) => {
          return checkExistence('groups', group._id);
        })).to.eventually.eql(false);
      });  
    });
    
    context('private guild', () => {
      let guild;
      
      beforeEach(() => {
        return generateGroup(user, {
          type: 'guild',
          privacy: 'private'
        })
        .then((gld) => {
          guild = gld;
        });
      });
      
      it('deletes private guild when user is the only member', () => {
      return expect(api.del('/user').then((duser) => {
          return checkExistence('groups', guild._id);
        })).to.eventually.eql(false);
      });
    });
  });

  context('user in group with members', () => {

    it('removes user from all groups user was a part of');

    it('chooses new group leader for any group user was the leader of');

    it('removes invitations from groups');
  });
});