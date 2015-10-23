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

    beforeEach((done) => {
      createAndPopulateGroup({
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
        done();
      }).catch(done);
    });

    it('makes the joining user the leader', (done) => {
      let api = requester(user);
      api.post(`/groups/${group._id}/join`).then((result) => {
        return api.get(`/groups/${group._id}`);
      }).then((group) => {
        expect(group.leader._id).to.eql(user._id);
        done();
      }).catch(done);
    });
  });
});
