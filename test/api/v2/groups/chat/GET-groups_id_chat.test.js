import {
  createAndPopulateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('GET /groups/:id/chat', () => {

  context('group with multiple messages', () => {
    let group, member, message1, message2, user;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 1,
      }).then((res) => {
        group = res.group;
        user = res.leader;
        member = res.members[0];

        return requester(member).post(`/groups/${group._id}/chat`, null, { message: 'Group member message' });
      }).then((res) => {
        message1 = res.message;

        return requester(user).post(`/groups/${group._id}/chat`, null, { message: 'User message' });
      }).then((res) => {
        message2 = res.message;
      });
    });

    it('gets messages', () => {
      let api = requester(user);

      return api.get(`/groups/${group._id}/chat`).then((messages) => {
        expect(messages).to.have.length(2);

        let message = messages[0];
        expect(message.id).to.exist;
        expect(message.text).to.exist;
        expect(message.uuid).to.exist;
      });
    });
  });
});
