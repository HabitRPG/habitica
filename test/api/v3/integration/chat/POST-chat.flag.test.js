import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { find } from 'lodash';

describe('POST /chat/:chatId/flag', () => {
  let user, admin, anotherUser, group;
  const TEST_MESSAGE = 'Test Message';

  beforeEach(async () => {
    user = await generateUser({balance: 1});
    admin = await generateUser({balance: 1, 'contributor.admin': true});
    anotherUser = await generateUser();

    group = await user.post('/groups', {
      name: 'Test Guild',
      type: 'guild',
      privacy: 'public',
    });
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

  it('Flags a chat', async () => {
    let { message } = await anotherUser.post(`/groups/${group._id}/chat`, {message: TEST_MESSAGE});

    let flagResult = await user.post(`/groups/${group._id}/chat/${message.id}/flag`);
    expect(flagResult.flags[user._id]).to.equal(true);
    expect(flagResult.flagCount).to.equal(1);

    let groupWithFlags = await admin.get(`/groups/${group._id}`);

    let messageToCheck = find(groupWithFlags.chat, {id: message.id});
    expect(messageToCheck.flags[user._id]).to.equal(true);
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

  it('Returns an error when user tries to flag a message that is already flagged', async () => {
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
