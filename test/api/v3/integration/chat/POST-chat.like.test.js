import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { find } from 'lodash';

describe('POST /chat/:chatId/like', () => {
  let user;
  let groupWithChat;
  let testMessage = 'Test Message';
  let anotherUser;

  before(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
        privacy: 'public',
      },
      members: 1,
    });

    user = groupLeader;
    groupWithChat = group;
    anotherUser = members[0];
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
    let message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});

    await expect(user.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatLikeOwnMessage'),
      });
  });

  it('Likes a chat', async () => {
    let message = await anotherUser.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});

    let likeResult = await user.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`);

    expect(likeResult.likes[user._id]).to.equal(true);

    let groupWithChatLikes = await user.get(`/groups/${groupWithChat._id}`);

    let messageToCheck = find(groupWithChatLikes.chat, {id: message.message.id});
    expect(messageToCheck.likes[user._id]).to.equal(true);
  });

  it('Unlikes a chat', async () => {
    let message = await anotherUser.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});

    let likeResult = await user.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`);
    expect(likeResult.likes[user._id]).to.equal(true);

    let unlikeResult = await user.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`);
    expect(unlikeResult.likes[user._id]).to.equal(false);

    let groupWithoutChatLikes = await user.get(`/groups/${groupWithChat._id}`);

    let messageToCheck = find(groupWithoutChatLikes.chat, {id: message.message.id});
    expect(messageToCheck.likes[user._id]).to.equal(false);
  });
});
