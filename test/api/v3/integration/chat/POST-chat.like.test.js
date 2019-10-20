import { find } from 'lodash';
import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /chat/:chatId/like', () => {
  let user;
  let groupWithChat;
  const testMessage = 'Test Message';
  let anotherUser;

  before(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
        privacy: 'public',
      },
      members: 1,
    });

    user = groupLeader;
    groupWithChat = group;
    anotherUser = members[0]; // eslint-disable-line prefer-destructuring
  });

  it('Returns an error when chat message is not found', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat/incorrectMessage/like`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('Returns an error when user tries to like their own message', async () => {
    const message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

    await expect(user.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatLikeOwnMessage'),
      });
  });

  it('Likes a chat', async () => {
    const message = await anotherUser.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

    const likeResult = await user.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`);

    expect(likeResult.likes[user._id]).to.equal(true);

    const groupWithChatLikes = await user.get(`/groups/${groupWithChat._id}`);

    const messageToCheck = find(groupWithChatLikes.chat, { id: message.message.id });
    expect(messageToCheck.likes[user._id]).to.equal(true);
  });

  it('Unlikes a chat', async () => {
    const message = await anotherUser.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

    const likeResult = await user.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`);
    expect(likeResult.likes[user._id]).to.equal(true);

    const unlikeResult = await user.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`);
    expect(unlikeResult.likes[user._id]).to.equal(false);

    const groupWithoutChatLikes = await user.get(`/groups/${groupWithChat._id}`);

    const messageToCheck = find(groupWithoutChatLikes.chat, { id: message.message.id });
    expect(messageToCheck.likes[user._id]).to.equal(false);
  });
});
