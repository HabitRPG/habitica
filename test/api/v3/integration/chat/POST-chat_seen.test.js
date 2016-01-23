import {
  createAndPopulateGroup,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /groups/:id/chat/seen', () => {
  let groupWithChat, message, author, member;

  before(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'public',
      },
      members: 1,
    });

    groupWithChat = group;
    author = groupLeader;
    member = members[0];

    message = await author.post(`/groups/${groupWithChat._id}/chat`, { message: 'Some message' });
    message = message.message;
  });

  it('clears new messages', async () => {
    await member.post(`/groups/${groupWithChat._id}/chat/seen`);

    let userThatHasSeenChat = await member.get('/user');

    expect(userThatHasSeenChat.newMessages).to.be.empty;
  });
});
