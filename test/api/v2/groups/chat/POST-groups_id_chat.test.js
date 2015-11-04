import {
  createAndPopulateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /groups/:id/chat', () => {

  let api, group, user;

  beforeEach(() => {
    return createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'public',
      },
    }).then((res) => {
      group = res.group;
      user = res.leader;
      api = requester(user);
    });
  });

  it('creates a chat message', () => {
    return api.post(`/groups/${group._id}/chat`, null, {
      message: 'Test Message',
    }).then((res) => {
      let message = res.message;

      expect(message.id).to.exist;
      expect(message.timestamp).to.exist;
      expect(message.text).to.eql('Test Message');
      expect(message.uuid).to.eql(user._id);
    });
  });

  it('does not post an empty message', () => {
    return expect(api.post(`/groups/${group._id}/chat`, null, {
      message: '',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      text: t('messageGroupChatBlankMessage'),
    });
  });
});
