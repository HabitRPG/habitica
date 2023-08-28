import { IncomingWebhook } from '@slack/webhook';
import { v4 as generateUUID } from 'uuid';
import {
  createAndPopulateGroup,
  translate as t,
  sleep,
  server,
} from '../../../../helpers/api-integration/v3';
import {
  SPAM_MIN_EXEMPT_CONTRIB_LEVEL,
} from '../../../../../website/server/models/group';
import { MAX_MESSAGE_LENGTH } from '../../../../../website/common/script/constants';
import * as email from '../../../../../website/server/libs/email';

describe('POST /chat', () => {
  let user; let groupWithChat; let member; let
    additionalMember;
  const testMessage = 'Test Message';
  const testBannedWordMessage = 'TESTPLACEHOLDERSWEARWORDHERE';
  const testSlurMessage = 'message with TESTPLACEHOLDERSLURWORDHERE';

  before(async () => {
    const { group, groupLeader, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'Test Guild',
        type: 'guild',
        privacy: 'private',
      },
      members: 2,
      upgradeToGroupPlan: true,
    });
    user = groupLeader;
    await user.update({
      'contributor.level': SPAM_MIN_EXEMPT_CONTRIB_LEVEL,
      'auth.timestamps.created': new Date('2022-01-01'),
    }); // prevent tests accidentally throwing messageGroupChatSpam
    groupWithChat = group;
    [member, additionalMember] = members;
    await member.update({ 'auth.timestamps.created': new Date('2022-01-01') });
    await additionalMember.update({ 'auth.timestamps.created': new Date('2022-01-01') });
  });

  it('Returns an error when no message is provided', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: '' }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
  });

  it('Returns an error when an empty message is provided', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: '    ' }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
  });

  it('Returns an error when an message containing only newlines is provided', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: '\n\n' }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
  });

  it('Returns an error when group is not found', async () => {
    await expect(user.post('/groups/invalidID/chat', { message: testMessage })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  describe('mute user', () => {
    afterEach(() => {
      member.update({ 'flags.chatRevoked': false });
    });

    it('does not error when chat privileges are revoked when sending a message to a private guild', async () => {
      await member.update({
        'flags.chatRevoked': true,
      });

      const message = await member.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

      expect(message.message.id).to.exist;
    });

    it('does not error when chat privileges are revoked when sending a message to a party', async () => {
      const { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Party',
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });

      const privatePartyMemberWithChatsRevoked = members[0];
      await privatePartyMemberWithChatsRevoked.update({
        'flags.chatRevoked': true,
        'auth.timestamps.created': new Date('2022-01-01'),
      });

      const message = await privatePartyMemberWithChatsRevoked.post(`/groups/${group._id}/chat`, { message: testMessage });

      expect(message.message.id).to.exist;
    });
  });

  describe('shadow-mute user', () => {
    beforeEach(() => {
      sandbox.spy(email, 'sendTxn');
      sandbox.stub(IncomingWebhook.prototype, 'send').returns(Promise.resolve());
    });

    afterEach(() => {
      sandbox.restore();
      member.update({ 'flags.chatShadowMuted': false });
    });

    it('creates a chat with zero flagCount when sending a message to a private guild', async () => {
      await member.update({
        'flags.chatShadowMuted': true,
      });

      const message = await member.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

      expect(message.message.id).to.exist;
      expect(message.message.flagCount).to.eql(0);
    });

    it('creates a chat with zero flagCount when sending a message to a party', async () => {
      const { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Party',
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });

      const userWithChatShadowMuted = members[0];
      await userWithChatShadowMuted.update({
        'flags.chatShadowMuted': true,
        'auth.timestamps.created': new Date('2022-01-01'),
      });

      const message = await userWithChatShadowMuted.post(`/groups/${group._id}/chat`, { message: testMessage });

      expect(message.message.id).to.exist;
      expect(message.message.flagCount).to.eql(0);
    });
  });

  context('banned word', () => {
    it('does not error when sending a chat message containing a banned word to a party', async () => {
      const { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Party',
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });
      await members[0].update({ 'auth.timestamps.created': new Date('2022-01-01') });

      const message = await members[0].post(`/groups/${group._id}/chat`, { message: testBannedWordMessage });

      expect(message.message.id).to.exist;
    });

    it('does not error when sending a chat message containing a banned word to a private guild', async () => {
      const message = await member.post(`/groups/${groupWithChat._id}/chat`, { message: testBannedWordMessage });

      expect(message.message.id).to.exist;
    });
  });

  context('banned slur', () => {
    beforeEach(() => {
      sandbox.spy(email, 'sendTxn');
      sandbox.stub(IncomingWebhook.prototype, 'send').returns(Promise.resolve());
    });

    afterEach(() => {
      sandbox.restore();
      user.update({ 'flags.chatRevoked': false });
    });

    it('allows slurs in private groups', async () => {
      const { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Party',
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });
      await members[0].update({ 'auth.timestamps.created': new Date('2022-01-01') });

      const message = await members[0].post(`/groups/${group._id}/chat`, { message: testSlurMessage });

      expect(message.message.id).to.exist;
    });
  });

  it('errors when user account is too young', async () => {
    await user.update({ 'auth.timestamps.created': new Date() });
    await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: 'hi im new' }))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('chatTemporarilyUnavailable'),
      });
    await user.update({ 'auth.timestamps.created': new Date('2022-01-01') });
  });

  it('creates a chat', async () => {
    const newMessage = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });
    const groupMessages = await user.get(`/groups/${groupWithChat._id}/chat`);

    expect(newMessage.message.id).to.exist;
    expect(groupMessages[0].id).to.exist;
  });

  it('creates a chat with mentions', async () => {
    const messageWithMentions = `hi @${member.auth.local.username}`;
    const newMessage = await user.post(`/groups/${groupWithChat._id}/chat`, { message: messageWithMentions });
    const groupMessages = await user.get(`/groups/${groupWithChat._id}/chat`);

    expect(newMessage.message.id).to.exist;
    expect(newMessage.message.text).to.include(`[@${member.auth.local.username}](/profile/${member._id})`);
    expect(groupMessages[0].id).to.exist;
  });

  it('creates a chat with a max length of 3000 chars', async () => {
    const veryLongMessage = `
    123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789.
    THIS PART WON'T BE IN THE MESSAGE (over 3000)
    `;
    expect(veryLongMessage.length > MAX_MESSAGE_LENGTH).to.equal(true);

    const newMessage = await user.post(`/groups/${groupWithChat._id}/chat`, { message: veryLongMessage });
    const groupMessages = await user.get(`/groups/${groupWithChat._id}/chat`);

    expect(newMessage.message.id).to.exist;
    expect(groupMessages[0].id).to.exist;

    expect(newMessage.message.text.length).to.eql(MAX_MESSAGE_LENGTH);
    expect(newMessage.message.text).to.not.contain('MESSAGE');
    expect(groupMessages[0].text.length).to.eql(MAX_MESSAGE_LENGTH);
  });

  it('chat message with mentions - mention link should not count towards 3000 chars limit', async () => {
    const memberUsername = 'memberUsername';
    await member.update({ 'auth.local.username': memberUsername });

    const messageWithMentions = `hi @${memberUsername} 123456789
     123456789 123456789 123456789 123456789 123456789 123456789 89 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 12345678 END.`;
    expect(messageWithMentions.length).to.equal(MAX_MESSAGE_LENGTH);
    const newMessage = await user.post(`/groups/${groupWithChat._id}/chat`, { message: messageWithMentions });
    const groupMessages = await user.get(`/groups/${groupWithChat._id}/chat`);

    const mentionLink = `[@${memberUsername}](/profile/${member._id})`;
    expect(newMessage.message.text).to.include(mentionLink);
    expect(newMessage.message.text).to.include(' END.');
    expect(newMessage.message.text.length)
      .to.eql(messageWithMentions.length - (`@${memberUsername}`).length + mentionLink.length);
    expect(groupMessages[0].text.length).to.eql(newMessage.message.text.length);
  });

  it('creates a chat with user styles', async () => {
    const mount = 'test-mount';
    const pet = 'test-pet';
    const style = 'test-style';
    await user.update({
      'items.currentMount': mount,
      'items.currentPet': pet,
      'preferences.style': style,
    });

    const message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

    expect(message.message.id).to.exist;
    expect(message.message.userStyles.items.currentMount).to.eql(user.items.currentMount);
    expect(message.message.userStyles.items.currentPet).to.eql(user.items.currentPet);
    expect(message.message.userStyles.preferences.style).to.eql(user.preferences.style);
    expect(message.message.userStyles.preferences.hair).to.eql(user.preferences.hair);
    expect(message.message.userStyles.preferences.skin).to.eql(user.preferences.skin);
    expect(message.message.userStyles.preferences.shirt).to.eql(user.preferences.shirt);
    expect(message.message.userStyles.preferences.chair).to.eql(user.preferences.chair);
    expect(message.message.userStyles.preferences.background)
      .to.eql(user.preferences.background);
  });

  it('creates equipped to user styles', async () => {
    const message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

    expect(message.message.id).to.exist;
    expect(message.message.userStyles.items.gear.equipped)
      .to.eql(user.items.gear.equipped);
    expect(message.message.userStyles.items.gear.costume).to.not.exist;
  });

  it('creates costume to user styles', async () => {
    await user.update({ 'preferences.costume': true });

    const message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

    expect(message.message.id).to.exist;
    expect(message.message.userStyles.items.gear.costume).to.eql(user.items.gear.costume);
    expect(message.message.userStyles.items.gear.equipped).to.not.exist;
  });

  it('adds backer info to chat', async () => {
    const backerInfo = {
      npc: 'Town Crier',
      tier: 800,
      tokensApplied: true,
    };
    await user.update({
      backer: backerInfo,
    });

    const message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });
    const messageBackerInfo = message.message.backer;

    expect(messageBackerInfo.npc).to.equal(backerInfo.npc);
    expect(messageBackerInfo.tier).to.equal(backerInfo.tier);
    expect(messageBackerInfo.tokensApplied).to.equal(backerInfo.tokensApplied);
  });

  it('sends group chat received webhooks', async () => {
    const userUuid = generateUUID();
    const memberUuid = generateUUID();
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

    const message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });

    await sleep();

    await server.close();

    const userBody = server.getWebhookData(userUuid);
    const memberBody = server.getWebhookData(memberUuid);

    [userBody, memberBody].forEach(body => {
      expect(body.group.id).to.eql(groupWithChat._id);
      expect(body.group.name).to.eql(groupWithChat.name);
      expect(body.chat).to.eql(message.message);
    });
  });

  context('chat notifications', () => {
    beforeEach(() => {
      member.update({ newMessages: {}, notifications: [] });
    });

    it('notifies other users of new messages for a guild', async () => {
      const message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage });
      const memberWithNotification = await member.get('/user');

      expect(message.message.id).to.exist;
      expect(memberWithNotification.newMessages[`${groupWithChat._id}`]).to.exist;
      expect(memberWithNotification.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupWithChat._id)).to.exist;
    });

    it('notifies other users of new messages for a party', async () => {
      const { group, groupLeader, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Test Party',
          type: 'party',
          privacy: 'private',
        },
        members: 1,
        leaderDetails: {
          'auth.timestamps.created': new Date('2022-01-01'),
        },
      });

      const message = await groupLeader.post(`/groups/${group._id}/chat`, { message: testMessage });
      const memberWithNotification = await members[0].get('/user');

      expect(message.message.id).to.exist;
      expect(memberWithNotification.newMessages[`${group._id}`]).to.exist;
      expect(memberWithNotification.notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === group._id)).to.exist;
    });
  });
});
