import { IncomingWebhook } from '@slack/client';
import nconf from 'nconf';
import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
  sleep,
  server,
} from '../../../../helpers/api-integration/v3';
import {
  SPAM_MESSAGE_LIMIT,
  SPAM_MIN_EXEMPT_CONTRIB_LEVEL,
  TAVERN_ID,
} from '../../../../../website/server/models/group';
import { CHAT_FLAG_FROM_SHADOW_MUTE } from '../../../../../website/common/script/constants';
import { v4 as generateUUID } from 'uuid';
import { getMatchesByWordArray } from '../../../../../website/server/libs/stringUtils';
import bannedWords from '../../../../../website/server/libs/bannedWords';
import guildsAllowingBannedWords from '../../../../../website/server/libs/guildsAllowingBannedWords';
import * as email from '../../../../../website/server/libs/email';

const BASE_URL = nconf.get('BASE_URL');

describe('POST /chat', () => {
  let user, groupWithChat, member, additionalMember;
  let testMessage = 'Test Message';
  let testBannedWordMessage = 'TESTPLACEHOLDERSWEARWORDHERE';
  let testBannedWordMessage1 = 'TESTPLACEHOLDERSWEARWORDHERE1';
  let testSlurMessage = 'message with TESTPLACEHOLDERSLURWORDHERE';
  let testSlurMessage1 = 'TESTPLACEHOLDERSLURWORDHERE1';
  let bannedWordErrorMessage = t('bannedWordUsed', {swearWordsUsed: testBannedWordMessage});

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
    await user.update({'contributor.level': SPAM_MIN_EXEMPT_CONTRIB_LEVEL}); // prevent tests accidentally throwing messageGroupChatSpam
    groupWithChat = group;
    member = members[0];
    additionalMember = members[1];
  });

  it('Returns an error when no message is provided', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: ''}))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
  });

  it('Returns an error when an empty message is provided', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: '    '}))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
  });

  it('Returns an error when an message containing only newlines is provided', async () => {
    await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: '\n\n'}))
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

  describe('mute user', () => {
    afterEach(() => {
      member.update({'flags.chatRevoked': false});
    });

    it('returns an error when chat privileges are revoked when sending a message to a public guild', async () => {
      const userWithChatRevoked = await member.update({'flags.chatRevoked': true});
      await expect(userWithChatRevoked.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage})).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('chatPrivilegesRevoked'),
      });
    });

    it('does not error when chat privileges are revoked when sending a message to a private guild', async () => {
      const { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Private Guild',
          type: 'guild',
          privacy: 'private',
        },
        members: 1,
      });

      const privateGuildMemberWithChatsRevoked = members[0];
      await privateGuildMemberWithChatsRevoked.update({'flags.chatRevoked': true});

      const message = await privateGuildMemberWithChatsRevoked.post(`/groups/${group._id}/chat`, { message: testMessage});

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
      await privatePartyMemberWithChatsRevoked.update({'flags.chatRevoked': true});

      const message = await privatePartyMemberWithChatsRevoked.post(`/groups/${group._id}/chat`, { message: testMessage});

      expect(message.message.id).to.exist;
    });
  });

  describe('shadow-mute user', () => {
    beforeEach(() => {
      sandbox.spy(email, 'sendTxn');
      sandbox.stub(IncomingWebhook.prototype, 'send');
    });

    afterEach(() => {
      sandbox.restore();
      member.update({'flags.chatShadowMuted': false});
    });

    it('creates a chat with flagCount already set and notifies mods when sending a message to a public guild', async () => {
      const userWithChatShadowMuted = await member.update({'flags.chatShadowMuted': true});
      const message = await userWithChatShadowMuted.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});
      expect(message.message.id).to.exist;
      expect(message.message.flagCount).to.eql(CHAT_FLAG_FROM_SHADOW_MUTE);

      // Email sent to mods
      await sleep(0.5);
      expect(email.sendTxn).to.be.calledOnce;
      expect(email.sendTxn.args[0][1]).to.eql('shadow-muted-post-report-to-mods');

      // Slack message to mods
      expect(IncomingWebhook.prototype.send).to.be.calledOnce;
      /* eslint-disable camelcase */
      expect(IncomingWebhook.prototype.send).to.be.calledWith({
        text: `@${member.auth.local.username} / ${member.profile.name} posted while shadow-muted`,
        attachments: [{
          fallback: 'Shadow-Muted Message',
          color: 'danger',
          author_name: `@${member.auth.local.username} ${member.profile.name} (${member.auth.local.email}; ${member._id})`,
          title: 'Shadow-Muted Post in Test Guild',
          title_link: `${BASE_URL}/groups/guild/${groupWithChat.id}`,
          text: testMessage,
          mrkdwn_in: [
            'text',
          ],
        }],
      });
      /* eslint-enable camelcase */
    });

    it('creates a chat with zero flagCount when sending a message to a private guild', async () => {
      const { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Private Guild',
          type: 'guild',
          privacy: 'private',
        },
        members: 1,
      });

      const userWithChatShadowMuted = members[0];
      await userWithChatShadowMuted.update({'flags.chatShadowMuted': true});

      const message = await userWithChatShadowMuted.post(`/groups/${group._id}/chat`, { message: testMessage});

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
      await userWithChatShadowMuted.update({'flags.chatShadowMuted': true});

      const message = await userWithChatShadowMuted.post(`/groups/${group._id}/chat`, { message: testMessage});

      expect(message.message.id).to.exist;
      expect(message.message.flagCount).to.eql(0);
    });

    it('creates a chat with zero flagCount when non-shadow-muted user sends a message to a public guild', async () => {
      const message = await member.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});
      expect(message.message.id).to.exist;
      expect(message.message.flagCount).to.eql(0);
    });
  });

  context('banned word', () => {
    it('returns an error when chat message contains a banned word in tavern', async () => {
      await expect(user.post('/groups/habitrpg/chat', { message: testBannedWordMessage}))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: bannedWordErrorMessage,
        });
    });

    it('returns an error when chat message contains a banned word in a public guild', async () => {
      let { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'public guild',
          type: 'guild',
          privacy: 'public',
        },
        members: 1,
      });

      await expect(members[0].post(`/groups/${group._id}/chat`, { message: testBannedWordMessage}))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: bannedWordErrorMessage,
        });
    });

    it('errors when word is part of a phrase', async () => {
      let wordInPhrase = `phrase ${testBannedWordMessage} end`;
      await expect(user.post('/groups/habitrpg/chat', { message: wordInPhrase}))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: bannedWordErrorMessage,
        });
    });

    it('errors when word is surrounded by non alphabet characters', async () => {
      let wordInPhrase = `_!${testBannedWordMessage}@_`;
      await expect(user.post('/groups/habitrpg/chat', { message: wordInPhrase}))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: bannedWordErrorMessage,
        });
    });

    it('errors when word is typed in mixed case', async () => {
      let substrLength = Math.floor(testBannedWordMessage.length / 2);
      let chatMessage = testBannedWordMessage.substring(0, substrLength).toLowerCase() + testBannedWordMessage.substring(substrLength).toUpperCase();
      await expect(user.post('/groups/habitrpg/chat', { message: chatMessage }))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('bannedWordUsed', {swearWordsUsed: chatMessage}),
        });
    });

    it('checks error message has all the banned words used, regardless of case', async () => {
      let testBannedWords = [testBannedWordMessage.toUpperCase(), testBannedWordMessage1.toLowerCase()];
      let chatMessage = `Mixing ${testBannedWords[0]} and ${testBannedWords[1]} is bad for you.`;
      await expect(user.post('/groups/habitrpg/chat', { message: chatMessage}))
        .to.eventually.be.rejected
        .and.have.property('message')
        .that.includes(testBannedWords.join(', '));
    });

    it('check all banned words are matched', async () => {
      let message = bannedWords.join(',').replace(/\\/g, '');
      let matches = getMatchesByWordArray(message, bannedWords);
      expect(matches.length).to.equal(bannedWords.length);
    });

    it('does not error when bad word is suffix of a word', async () => {
      let wordAsSuffix = `prefix${testBannedWordMessage}`;
      let message = await user.post('/groups/habitrpg/chat', { message: wordAsSuffix});

      expect(message.message.id).to.exist;
    });

    it('does not error when bad word is prefix of a word', async () => {
      let wordAsPrefix = `${testBannedWordMessage}suffix`;
      let message = await user.post('/groups/habitrpg/chat', { message: wordAsPrefix});

      expect(message.message.id).to.exist;
    });

    it('does not error when sending a chat message containing a banned word to a party', async () => {
      let { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Party',
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });

      let message = await members[0].post(`/groups/${group._id}/chat`, { message: testBannedWordMessage});

      expect(message.message.id).to.exist;
    });

    it('does not error when sending a chat message containing a banned word to a public guild in which banned words are allowed', async () => {
      let { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'public guild',
          type: 'guild',
          privacy: 'public',
        },
        members: 1,
      });

      guildsAllowingBannedWords[group._id] = true;

      let message = await members[0].post(`/groups/${group._id}/chat`, { message: testBannedWordMessage});

      expect(message.message.id).to.exist;
    });

    it('does not error when sending a chat message containing a banned word to a private guild', async () => {
      let { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'private guild',
          type: 'guild',
          privacy: 'private',
        },
        members: 1,
      });

      let message = await members[0].post(`/groups/${group._id}/chat`, { message: testBannedWordMessage});

      expect(message.message.id).to.exist;
    });
  });

  context('banned slur', () => {
    beforeEach(() => {
      sandbox.spy(email, 'sendTxn');
      sandbox.stub(IncomingWebhook.prototype, 'send');
    });

    afterEach(() => {
      sandbox.restore();
      user.update({'flags.chatRevoked': false});
    });

    it('errors and revokes privileges when chat message contains a banned slur', async () => {
      await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: testSlurMessage})).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('bannedSlurUsed'),
      });

      // Email sent to mods
      await sleep(0.5);
      expect(email.sendTxn).to.be.calledOnce;
      expect(email.sendTxn.args[0][1]).to.eql('slur-report-to-mods');

      // Slack message to mods
      expect(IncomingWebhook.prototype.send).to.be.calledOnce;
      /* eslint-disable camelcase */
      expect(IncomingWebhook.prototype.send).to.be.calledWith({
        text: `${user.profile.name} (${user.id}) tried to post a slur`,
        attachments: [{
          fallback: 'Slur Message',
          color: 'danger',
          author_name: `@${user.auth.local.username} ${user.profile.name} (${user.auth.local.email}; ${user._id})`,
          title: 'Slur in Test Guild',
          title_link: `${BASE_URL}/groups/guild/${groupWithChat.id}`,
          text: testSlurMessage,
          mrkdwn_in: [
            'text',
          ],
        }],
      });
      /* eslint-enable camelcase */

      // Chat privileges are revoked
      await expect(user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage})).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('chatPrivilegesRevoked'),
      });
    });

    it('does not allow slurs in private groups', async () => {
      let { group, members } = await createAndPopulateGroup({
        groupDetails: {
          name: 'Party',
          type: 'party',
          privacy: 'private',
        },
        members: 1,
      });

      await expect(members[0].post(`/groups/${group._id}/chat`, { message: testSlurMessage})).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('bannedSlurUsed'),
      });

      // Email sent to mods
      await sleep(0.5);
      expect(email.sendTxn).to.be.calledThrice;
      expect(email.sendTxn.args[2][1]).to.eql('slur-report-to-mods');

      // Slack message to mods
      expect(IncomingWebhook.prototype.send).to.be.calledOnce;
      /* eslint-disable camelcase */
      expect(IncomingWebhook.prototype.send).to.be.calledWith({
        text: `${members[0].profile.name} (${members[0].id}) tried to post a slur`,
        attachments: [{
          fallback: 'Slur Message',
          color: 'danger',
          author_name: `@${members[0].auth.local.username} ${members[0].profile.name} (${members[0].auth.local.email}; ${members[0]._id})`,
          title: 'Slur in Party - (private party)',
          title_link: undefined,
          text: testSlurMessage,
          mrkdwn_in: [
            'text',
          ],
        }],
      });
      /* eslint-enable camelcase */

      // Chat privileges are revoked
      await expect(members[0].post(`/groups/${groupWithChat._id}/chat`, { message: testMessage})).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('chatPrivilegesRevoked'),
      });
    });

    it('errors when slur is typed in mixed case', async () => {
      let substrLength = Math.floor(testSlurMessage1.length / 2);
      let chatMessage = testSlurMessage1.substring(0, substrLength).toLowerCase() + testSlurMessage1.substring(substrLength).toUpperCase();
      await expect(user.post('/groups/habitrpg/chat', { message: chatMessage }))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('bannedSlurUsed'),
        });
    });
  });

  it('creates a chat', async () => {
    const newMessage = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});
    const groupMessages = await user.get(`/groups/${groupWithChat._id}/chat`);

    expect(newMessage.message.id).to.exist;
    expect(groupMessages[0].id).to.exist;
  });

  it('creates a chat with a max length of 3000 chars', async () => {
    const veryLongMessage = `
    123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789.
    THIS PART WON'T BE IN THE MESSAGE (over 3000)
    `;

    const newMessage = await user.post(`/groups/${groupWithChat._id}/chat`, { message: veryLongMessage});
    const groupMessages = await user.get(`/groups/${groupWithChat._id}/chat`);

    expect(newMessage.message.id).to.exist;
    expect(groupMessages[0].id).to.exist;

    expect(newMessage.message.text.length).to.eql(3000);
    expect(newMessage.message.text).to.not.contain('MESSAGE');
    expect(groupMessages[0].text.length).to.eql(3000);
  });

  it('creates a chat with user styles', async () => {
    const mount = 'test-mount';
    const pet = 'test-pet';
    const style = 'test-style';
    const userWithStyle = await generateUser({
      'items.currentMount': mount,
      'items.currentPet': pet,
      'preferences.style': style,
    });
    await userWithStyle.sync();

    const message = await userWithStyle.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});

    expect(message.message.id).to.exist;
    expect(message.message.userStyles.items.currentMount).to.eql(userWithStyle.items.currentMount);
    expect(message.message.userStyles.items.currentPet).to.eql(userWithStyle.items.currentPet);
    expect(message.message.userStyles.preferences.style).to.eql(userWithStyle.preferences.style);
    expect(message.message.userStyles.preferences.hair).to.eql(userWithStyle.preferences.hair);
    expect(message.message.userStyles.preferences.skin).to.eql(userWithStyle.preferences.skin);
    expect(message.message.userStyles.preferences.shirt).to.eql(userWithStyle.preferences.shirt);
    expect(message.message.userStyles.preferences.chair).to.eql(userWithStyle.preferences.chair);
    expect(message.message.userStyles.preferences.background).to.eql(userWithStyle.preferences.background);
  });

  it('adds backer info to chat', async () => {
    const backerInfo = {
      npc: 'Town Crier',
      tier: 800,
      tokensApplied: true,
    };
    const backer = await generateUser({
      backer: backerInfo,
    });

    const message = await backer.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});
    const messageBackerInfo = message.message.backer;

    expect(messageBackerInfo.npc).to.equal(backerInfo.npc);
    expect(messageBackerInfo.tier).to.equal(backerInfo.tier);
    expect(messageBackerInfo.tokensApplied).to.equal(backerInfo.tokensApplied);
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
    expect(memberWithNotification.notifications.find(n => {
      return n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupWithChat._id;
    })).to.exist;
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
    expect(memberWithNotification.notifications.find(n => {
      return n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === group._id;
    })).to.exist;
  });

  context('Spam prevention', () => {
    it('Returns an error when the user has been posting too many messages', async () => {
      // Post as many messages are needed to reach the spam limit
      for (let i = 0; i < SPAM_MESSAGE_LIMIT; i++) {
        let result = await additionalMember.post(`/groups/${TAVERN_ID}/chat`, { message: testMessage }); // eslint-disable-line no-await-in-loop
        expect(result.message.id).to.exist;
      }

      await expect(additionalMember.post(`/groups/${TAVERN_ID}/chat`, { message: testMessage })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageGroupChatSpam'),
      });
    });

    it('contributor should not receive spam alert', async () => {
      let userSocialite = await member.update({'contributor.level': SPAM_MIN_EXEMPT_CONTRIB_LEVEL});

      // Post 1 more message than the spam limit to ensure they do not reach the limit
      for (let i = 0; i < SPAM_MESSAGE_LIMIT + 1; i++) {
        let result = await userSocialite.post(`/groups/${TAVERN_ID}/chat`, { message: testMessage }); // eslint-disable-line no-await-in-loop
        expect(result.message.id).to.exist;
      }
    });
  });
});
