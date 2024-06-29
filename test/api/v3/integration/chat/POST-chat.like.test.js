import { find } from 'lodash';
import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { model as Group } from '../../../../../website/server/models/group';

describe('POST /chat/:chatId/like', () => {
  let user;
  let anotherUser;
  let groupWithChat;
  let members;
  const testMessage = 'Test Message';

  before(async () => {
    ({ group: groupWithChat, groupLeader: user, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
        privacy: 'private',
      },
      members: 1,
      leaderDetails: {
        'auth.timestamps.created': new Date('2022-01-01'),
        balance: 10,
      },
      upgradeToGroupPlan: true,
    }));

    [anotherUser] = members;
    await anotherUser.updateOne({ 'auth.timestamps.created': new Date('2022-01-01') });
  });

  it('Returns an error when chat message is not found', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat/incorrectMessage/like`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
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

  it('Allows to likes their own chat message', async () => {
    const message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

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

  it('validates that the message belongs to the passed group', async () => {
    const { group: anotherGroup, groupLeader: anotherLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Another Guild',
        type: 'guild',
        privacy: 'private',
      },
      upgradeToGroupPlan: true,
    });

    const message = await anotherUser.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });
    await expect(anotherLeader.post(`/groups/${anotherGroup._id}/chat/${message.message.id}/like`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('does not like a message if the user is not in the group', async () => {
    const thirdUser = await generateUser();

    const message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });
    await expect(thirdUser.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
  });

  it('does not like a message that belongs to a sunset public group', async () => {
    const message = await anotherUser.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

    // Creation API is shut down, we need to simulate an extant public group
    await Group.updateOne({ _id: groupWithChat._id }, { $set: { privacy: 'public' }, $unset: { 'purchased.plan': 1 } }).exec();

    await expect(user.post(`/groups/${groupWithChat._id}/chat/${message.message.id}/like`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('featureRetired'),
      });
  });
});
