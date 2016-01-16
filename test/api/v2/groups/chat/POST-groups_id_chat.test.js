import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v2';

describe('POST /groups/:id/chat', () => {
  let group, user;

  beforeEach(async () => {
    return createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'public',
      },
    }).then((res) => {
      group = res.group;
      user = res.groupLeader;
    });
  });

  it('creates a chat message', async () => {
    return user.post(`/groups/${group._id}/chat`, null, {
      message: 'Test Message',
    }).then((res) => {
      let message = res.message;

      expect(message.id).to.exist;
      expect(message.timestamp).to.exist;
      expect(message.text).to.eql('Test Message');
      expect(message.uuid).to.eql(user._id);
    });
  });

  it('does not post an empty message', async () => {
    return expect(user.post(`/groups/${group._id}/chat`, null, {
      message: '',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      text: t('messageGroupChatBlankMessage'),
    });
  });
});
