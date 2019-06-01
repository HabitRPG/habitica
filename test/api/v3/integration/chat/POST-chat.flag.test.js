import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { find } from 'lodash';
import moment from 'moment';
import nconf from 'nconf';
import { IncomingWebhook } from '@slack/client';

const BASE_URL = nconf.get('BASE_URL');

describe('POST /chat/:chatId/flag', () => {
  let user, admin, anotherUser, newUser, group;
  const TEST_MESSAGE = 'Test Message';
  const USER_AGE_FOR_FLAGGING = 3;

  beforeEach(async () => {
    user = await generateUser({balance: 1, 'auth.timestamps.created': moment().subtract(USER_AGE_FOR_FLAGGING + 1, 'days').toDate()});
    admin = await generateUser({balance: 1, 'contributor.admin': true});
    anotherUser = await generateUser({'auth.timestamps.created': moment().subtract(USER_AGE_FOR_FLAGGING + 1, 'days').toDate()});
    newUser = await generateUser({'auth.timestamps.created': moment().subtract(1, 'days').toDate()});
    sandbox.stub(IncomingWebhook.prototype, 'send');

    group = await user.post('/groups', {
      name: 'Test Guild',
      type: 'guild',
      privacy: 'public',
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Returns an error when chat message is not found', async () => {
    await expect(user.post(`/groups/${group._id}/chat/incorrectMessage/flag`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatNotFound'),
      });
  });

  it('Allows players to flag their own message', async () => {
    let message = await user.post(`/groups/${group._id}/chat`, {message: TEST_MESSAGE});
    await expect(user.post(`/groups/${group._id}/chat/${message.message.id}/flag`)).to.eventually.be.ok;
  });

  it('Flags a chat and sends normal message to moderator Slack when user is not new', async () => {
    let { message } = await anotherUser.post(`/groups/${group._id}/chat`, {message: TEST_MESSAGE});

    let flagResult = await user.post(`/groups/${group._id}/chat/${message.id}/flag`);
    expect(flagResult.flags[user._id]).to.equal(true);
    expect(flagResult.flagCount).to.equal(1);

    let groupWithFlags = await admin.get(`/groups/${group._id}`);

    let messageToCheck = find(groupWithFlags.chat, {id: message.id});
    expect(messageToCheck.flags[user._id]).to.equal(true);

    // Slack message to mods
    const timestamp = `${moment(message.timestamp).utc().format('YYYY-MM-DD HH:mm')} UTC`;

    /* eslint-disable camelcase */
    expect(IncomingWebhook.prototype.send).to.be.calledWith({
      text: `${user.profile.name} (${user.id}; language: en) flagged a group message`,
      attachments: [{
        fallback: 'Flag Message',
        color: 'danger',
        author_name: `@${anotherUser.auth.local.username} ${anotherUser.profile.name} (${anotherUser.auth.local.email}; ${anotherUser._id})\n${timestamp}`,
        title: 'Flag in Test Guild',
        title_link: `${BASE_URL}/groups/guild/${group._id}`,
        text: TEST_MESSAGE,
        footer: `<https://habitrpg.github.io/flag-o-rama/?groupId=${group._id}&chatId=${message.id}|Flag this message.>`,
        mrkdwn_in: [
          'text',
        ],
      }],
    });
    /* eslint-ensable camelcase */
  });

  it('Does not increment message flag count and sends different message to moderator Slack when user is new', async () => {
    let automatedComment = `The post's flag count has not been increased because the flagger's account is less than ${USER_AGE_FOR_FLAGGING} days old.`;
    let { message } = await newUser.post(`/groups/${group._id}/chat`, {message: TEST_MESSAGE});

    let flagResult = await newUser.post(`/groups/${group._id}/chat/${message.id}/flag`);
    expect(flagResult.flags[newUser._id]).to.equal(true);
    expect(flagResult.flagCount).to.equal(0);

    let groupWithFlags = await admin.get(`/groups/${group._id}`);

    let messageToCheck = find(groupWithFlags.chat, {id: message.id});
    expect(messageToCheck.flags[newUser._id]).to.equal(true);

    // Slack message to mods
    const timestamp = `${moment(message.timestamp).utc().format('YYYY-MM-DD HH:mm')} UTC`;

    /* eslint-disable camelcase */
    expect(IncomingWebhook.prototype.send).to.be.calledWith({
      text: `${newUser.profile.name} (${newUser.id}; language: en) flagged a group message`,
      attachments: [{
        fallback: 'Flag Message',
        color: 'danger',
        author_name: `@${newUser.auth.local.username} ${newUser.profile.name} (${newUser.auth.local.email}; ${newUser._id})\n${timestamp}`,
        title: 'Flag in Test Guild',
        title_link: `${BASE_URL}/groups/guild/${group._id}`,
        text: TEST_MESSAGE,
        footer: `<https://habitrpg.github.io/flag-o-rama/?groupId=${group._id}&chatId=${message.id}|Flag this message.> ${automatedComment}`,
        mrkdwn_in: [
          'text',
        ],
      }],
    });
    /* eslint-ensable camelcase */
  });

  it('Flags a chat when the author\'s account was deleted', async () => {
    let deletedUser = await generateUser();
    let { message } = await deletedUser.post(`/groups/${group._id}/chat`, {message: TEST_MESSAGE});
    await deletedUser.del('/user', {
      password: 'password',
    });

    let flagResult = await user.post(`/groups/${group._id}/chat/${message.id}/flag`);
    expect(flagResult.flags[user._id]).to.equal(true);
    expect(flagResult.flagCount).to.equal(1);

    let groupWithFlags = await admin.get(`/groups/${group._id}`);

    let messageToCheck = find(groupWithFlags.chat, {id: message.id});
    expect(messageToCheck.flags[user._id]).to.equal(true);
  });

  it('Flags a chat with a higher flag acount when an admin flags the message', async () => {
    let { message } = await user.post(`/groups/${group._id}/chat`, {message: TEST_MESSAGE});

    let flagResult = await admin.post(`/groups/${group._id}/chat/${message.id}/flag`);
    expect(flagResult.flags[admin._id]).to.equal(true);
    expect(flagResult.flagCount).to.equal(5);

    let groupWithFlags = await admin.get(`/groups/${group._id}`);

    let messageToCheck = find(groupWithFlags.chat, {id: message.id});
    expect(messageToCheck.flags[admin._id]).to.equal(true);
    expect(messageToCheck.flagCount).to.equal(5);
  });

  it('allows admin to flag a message in a private group', async () => {
    let privateGroup = await user.post('/groups', {
      name: 'Test party',
      type: 'party',
      privacy: 'private',
    });
    await user.post(`/groups/${privateGroup._id}/invite`, {
      uuids: [anotherUser._id],
    });
    await anotherUser.post(`/groups/${privateGroup._id}/join`);
    let { message } = await user.post(`/groups/${privateGroup._id}/chat`, {message: TEST_MESSAGE});

    let flagResult = await admin.post(`/groups/${privateGroup._id}/chat/${message.id}/flag`);

    expect(flagResult.flags[admin._id]).to.equal(true);
    expect(flagResult.flagCount).to.equal(5);

    let groupWithFlags = await anotherUser.get(`/groups/${privateGroup._id}`);
    let messageToCheck = find(groupWithFlags.chat, {id: message.id});

    expect(messageToCheck).to.not.exist;
  });

  it('does not allow non member to flag message in private group', async () => {
    let privateGroup = await user.post('/groups', {
      name: 'Test party',
      type: 'party',
      privacy: 'private',
    });
    let { message } = await user.post(`/groups/${privateGroup._id}/chat`, {message: TEST_MESSAGE});

    await expect(anotherUser.post(`/groups/${privateGroup._id}/chat/${message.id}/flag`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
  });

  it('Returns an error when user tries to flag a message that they already flagged', async () => {
    let { message } = await anotherUser.post(`/groups/${group._id}/chat`, {message: TEST_MESSAGE});

    await user.post(`/groups/${group._id}/chat/${message.id}/flag`);

    await expect(user.post(`/groups/${group._id}/chat/${message.id}/flag`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageGroupChatFlagAlreadyReported'),
      });
  });

  it('shows a hidden message to the original poster', async () => {
    let { message } = await user.post(`/groups/${group._id}/chat`, {message: TEST_MESSAGE});

    await admin.post(`/groups/${group._id}/chat/${message.id}/flag`);

    let groupWithFlags = await user.get(`/groups/${group._id}`);
    let messageToCheck = find(groupWithFlags.chat, {id: message.id});

    expect(messageToCheck).to.exist;

    let auGroupWithFlags = await anotherUser.get(`/groups/${group._id}`);
    let auMessageToCheck = find(auGroupWithFlags.chat, {id: message.id});

    expect(auMessageToCheck).to.not.exist;
  });
});
