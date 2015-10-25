import {
  createAndPopulateGroup,
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('POST /groups/:id/join', () => {

  context('user is already a member of the group', () => {
    it('returns an error');
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
