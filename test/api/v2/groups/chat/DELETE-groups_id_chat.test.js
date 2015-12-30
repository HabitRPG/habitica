import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('DELETE /groups/:id/chat', () => {
  let group, message, user;

  beforeEach(() => {
    return createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'public',
      },
    }).then((res) => {
      group = res.group;
      user = res.leader;

      return user.post(`/groups/${group._id}/chat`, null, { message: 'Some message', });
    }).then((res) => {
      message = res.message;
    });
  });

  it('deletes a message', () => {
    return user.del(`/groups/${group._id}/chat/${message.id}`).then((res) => {
      return user.get(`/groups/${group._id}/chat/`);
    }).then((messages) => {
      expect(messages).to.have.length(0);
    });
  });

  it('returns an error is message does not exist', () => {
    return expect(user.del(`/groups/${group._id}/chat/some-fake-id`)).to.eventually.be.rejected.and.eql({
      code: 404,
      text: t('messageGroupChatNotFound'),
    });
  });
});
