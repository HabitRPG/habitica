import {
  createAndPopulateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration.helper';
import { each, find } from 'lodash';

describe('POST /groups/:id/join', () => {

  context('user is already a member of the group', () => {
    it('returns an error');
  });

  each({
    'public guild': {type: 'guild', privacy: 'public'},
    'private guild': {type: 'guild', privacy: 'private'},
    'party': {type: 'party', privacy: 'private'},
  }, (data, groupType) => {
    context(`user has invitation to a ${groupType}`, () => {
      let api, group, invitee;

      beforeEach(() => {
        return createAndPopulateGroup({
          groupDetails: {
            type: data.type,
            privacy: data.privacy,
          },
          invites: 1,
        }).then((res) => {
          group = res.group;
          invitee = res.invitees[0];
          api = requester(invitee);
        });
      });

      it(`allows user to join a ${groupType}`, () => {
        return api.post(`/groups/${group._id}/join`).then((res) => {
          return api.get(`/groups/${group._id}`);
        }).then((_group) => {
          let members = _group.members;
          let userInGroup = find(members, (user) => {
            return user._id === invitee._id;
          });

          expect(userInGroup).to.exist;
        });
      });
    });
  });

  each({
    'private guild': {type: 'guild', privacy: 'private'},
    'party': {type: 'party', privacy: 'private'},
  }, (data, groupType) => {
    context(`user does not have an invitation to a ${groupType}`, () => {
      let api, group, user;

      beforeEach(() => {
        return createAndPopulateGroup({
          groupDetails: {
            type: data.type,
            privacy: data.privacy,
          },
        }).then((res) => {
          group = res.group;
          return generateUser();
        }).then((generatedUser) => {
          user = generatedUser;
          api = requester(user);
        });
      });

      it(`does not allow user to join a ${groupType}`, () => {
        return expect(api.post(`/groups/${group._id}/join`).then((res) => {
          return api.get(`/groups/${group._id}`);
        })).to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('messageGroupRequiresInvite'),
        });
      });
    });
  });

  context('user does not have an invitation to a public group', () => {
    let api, group, user;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        group = res.group;
        return generateUser();
      }).then((generatedUser) => {
        user = generatedUser;
        api = requester(user);
      });
    });

    it('allows user to join a public guild', () => {
      return api.post(`/groups/${group._id}/join`).then((res) => {
        return api.get(`/groups/${group._id}`);
      }).then((_group) => {
        let members = _group.members;
        let userInGroup = find(members, (member) => {
          return user._id === user._id;
        });

        expect(userInGroup).to.exist;
      });
    });
  });

  context('public guild has no leader', () => {
    let user, group;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          name: 'test guild',
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        group = res.group;
        return requester(res.leader).post(`/groups/${group._id}/leave`);
      }).then((res) => {
        return generateUser();
      }).then((generatedUser) => {
        user = generatedUser;
      });
    });

    it('makes the joining user the leader', () => {
      let api = requester(user);
      return expect(api.post(`/groups/${group._id}/join`).then((result) => {
        return api.get(`/groups/${group._id}`);
      })).to.eventually.have.deep.property('leader._id', user._id);
    });
  });
});
