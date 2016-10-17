import {
  createAndPopulateGroup,
  translate as t,
  sleep,
  server,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /chat', () => {
  let user, groupWithChat, userWithChatRevoked, member;
  let testMessage = 'Test Message';

  before(async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
        privacy: 'public',
      },
      members: 2,
    });

    user = groupLeader;
    groupWithChat = group;
    userWithChatRevoked = await members[0].update({'flags.chatRevoked': true});
    member = members[0];
  });

  it('Returns an error when no message is provided', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: ''}))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
  });

  it('Returns an error when group is not found', async () => {
    await expect(user.post('/groups/invalidID/chat', { message: testMessage})).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('returns an error when chat privileges are revoked when sending a message to a public guild', async () => {
    await expect(userWithChatRevoked.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage})).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: 'Your chat privileges have been revoked.',
    });
  });

  it('does not error when sending a message to a private guild with a user with revoked chat', async () => {
    let { group, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Private Guild',
        type: 'guild',
        privacy: 'private',
      },
      members: 1,
    });

    let privateGuildMemberWithChatsRevoked = members[0];
    await privateGuildMemberWithChatsRevoked.update({'flags.chatRevoked': true});

    let message = await privateGuildMemberWithChatsRevoked.post(`/groups/${group._id}/chat`, { message: testMessage});

    expect(message.message.id).to.exist;
  });

  it('does not error when sending a message to a party with a user with revoked chat', async () => {
    let { group, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Party',
        type: 'party',
        privacy: 'private',
      },
      members: 1,
    });

    let privatePartyMemberWithChatsRevoked = members[0];
    await privatePartyMemberWithChatsRevoked.update({'flags.chatRevoked': true});

    let message = await privatePartyMemberWithChatsRevoked.post(`/groups/${group._id}/chat`, { message: testMessage});

    expect(message.message.id).to.exist;
  });

  it('creates a chat', async () => {
    let message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});

    expect(message.message.id).to.exist;
  });

  it('sends group chat received webhooks', async () => {
    let userUuid = generateUUID();
    let memberUuid = generateUUID();
    await server.start();

    await user.post('/user/webhook', {
      url: `http://localhost:${server.port}/webhooks/${userUuid}`,
      type: 'groupChatReceived',
      enabled: true,
      options: {
        groupId: groupWithChat.id,
      },
    });
    await member.post('/user/webhook', {
      url: `http://localhost:${server.port}/webhooks/${memberUuid}`,
      type: 'groupChatReceived',
      enabled: true,
      options: {
        groupId: groupWithChat.id,
      },
    });

    let message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

    await sleep();

    await server.close();

    let userBody = server.getWebhookData(userUuid);
    let memberBody = server.getWebhookData(memberUuid);

    [userBody, memberBody].forEach((body) => {
      expect(body.group.id).to.eql(groupWithChat._id);
      expect(body.group.name).to.eql(groupWithChat.name);
      expect(body.chat).to.eql(message.message);
    });
  });

  it('notifies other users of new messages for a guild', async () => {
    let message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});
    let memberWithNotification = await member.get('/user');

    expect(message.message.id).to.exist;
    expect(memberWithNotification.newMessages[`${groupWithChat._id}`]).to.exist;
  });

  it('notifies other users of new messages for a party', async () => {
    let { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Party',
        type: 'party',
        privacy: 'private',
      },
      members: 1,
    });

    let message = await groupLeader.post(`/groups/${group._id}/chat`, { message: testMessage});
    let memberWithNotification = await members[0].get('/user');

    expect(message.message.id).to.exist;
    expect(memberWithNotification.newMessages[`${group._id}`]).to.exist;
  });
});
