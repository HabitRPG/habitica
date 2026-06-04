import { v4 as generateUUID } from 'uuid';
import { find } from 'lodash';
import {
  createAndPopulateGroup,
  generateChallenge,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /challenges/:challengeId/message-participants', () => {
  const messageToSend = 'Challenge *Update* Message';
  const unformattedMessage = 'Challenge Update Message';

  async function createChallengeSetup (memberUpdates = []) {
    const { group, groupLeader } = await createAndPopulateGroup();
    const challenge = await generateChallenge(groupLeader, group);
    await groupLeader.post(`/challenges/${challenge._id}/join`);

    const members = await Promise.all(memberUpdates.map(update => generateUser({
      'party._id': group._id,
      ...update,
    })));

    await Promise.all(members.map(member => member.post(`/challenges/${challenge._id}/join`)));

    return {
      challenge,
      group,
      groupLeader,
      members,
    };
  }

  function findInboxMessage (user, senderId, text = messageToSend) {
    return find(user.inbox.messages, message => message.uuid === senderId
      && message.text === text);
  }

  it('returns error when challengeId is not a valid UUID', async () => {
    const user = await generateUser();

    await expect(user.post('/challenges/test/message-participants', {
      message: messageToSend,
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error when message is not provided', async () => {
    const { challenge, groupLeader } = await createChallengeSetup();

    await expect(groupLeader.post(`/challenges/${challenge._id}/message-participants`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
  });

  it('returns error when message is empty', async () => {
    const { challenge, groupLeader } = await createChallengeSetup();

    await expect(groupLeader.post(`/challenges/${challenge._id}/message-participants`, {
      message: '',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns error when challenge is not found', async () => {
    const user = await generateUser();

    await expect(user.post(`/challenges/${generateUUID()}/message-participants`, {
      message: messageToSend,
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('returns error when user cannot view the challenge', async () => {
    const { challenge } = await createChallengeSetup();
    const user = await generateUser();

    await expect(user.post(`/challenges/${challenge._id}/message-participants`, {
      message: messageToSend,
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('challengeNotFound'),
    });
  });

  it('rejects a participant who is not the challenge leader or challenge admin', async () => {
    const { challenge, members } = await createChallengeSetup([{}]);
    const member = members[0];

    await expect(member.post(`/challenges/${challenge._id}/message-participants`, {
      message: messageToSend,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('onlyLeaderMessageParticipantsChal'),
    });
  });

  it('allows the challenge leader to send to participants', async () => {
    const { challenge, groupLeader, members } = await createChallengeSetup([{}, {}]);

    const response = await groupLeader.post(`/challenges/${challenge._id}/message-participants`, {
      message: messageToSend,
    });

    expect(response).to.eql({
      totalParticipants: 3,
      attemptedRecipients: 2,
      sent: 2,
      skipped: 0,
      skippedByReason: {},
    });

    const updatedSender = await groupLeader.get('/user');
    const updatedMemberOne = await members[0].get('/user');
    const updatedMemberTwo = await members[1].get('/user');

    const messageInMemberOneInbox = findInboxMessage(updatedMemberOne, groupLeader._id);

    expect(messageInMemberOneInbox.unformattedText).to.equal(unformattedMessage);
    expect(findInboxMessage(updatedMemberTwo, groupLeader._id)).to.exist;
    expect(findInboxMessage(updatedSender, members[0]._id)).to.exist;
    expect(findInboxMessage(updatedSender, members[1]._id)).to.exist;
    expect(findInboxMessage(updatedSender, groupLeader._id)).to.not.exist;
  });

  it('allows a challenge admin to send to participants', async () => {
    const { challenge, groupLeader, members } = await createChallengeSetup([{}]);
    const admin = await generateUser({ 'permissions.challengeAdmin': true });

    const response = await admin.post(`/challenges/${challenge._id}/message-participants`, {
      message: messageToSend,
    });

    expect(response).to.eql({
      totalParticipants: 2,
      attemptedRecipients: 2,
      sent: 2,
      skipped: 0,
      skippedByReason: {},
    });

    const updatedLeader = await groupLeader.get('/user');
    const updatedMember = await members[0].get('/user');
    const updatedAdmin = await admin.get('/user');

    expect(findInboxMessage(updatedLeader, admin._id)).to.exist;
    expect(findInboxMessage(updatedMember, admin._id)).to.exist;
    expect(findInboxMessage(updatedAdmin, groupLeader._id)).to.exist;
    expect(findInboxMessage(updatedAdmin, members[0]._id)).to.exist;
  });

  it('excludes the sender from recipients', async () => {
    const { challenge, groupLeader } = await createChallengeSetup();

    const response = await groupLeader.post(`/challenges/${challenge._id}/message-participants`, {
      message: messageToSend,
    });

    const updatedSender = await groupLeader.get('/user');

    expect(response).to.eql({
      totalParticipants: 1,
      attemptedRecipients: 0,
      sent: 0,
      skipped: 0,
      skippedByReason: {},
    });
    expect(findInboxMessage(updatedSender, groupLeader._id)).to.not.exist;
  });

  it('handles partial delivery when a participant blocks the sender', async () => {
    const { challenge, groupLeader, members } = await createChallengeSetup([
      {},
      { 'inbox.blocks': [] },
    ]);
    await members[1].updateOne({ 'inbox.blocks': [groupLeader._id] });

    const response = await groupLeader.post(`/challenges/${challenge._id}/message-participants`, {
      message: messageToSend,
    });

    const updatedAllowedMember = await members[0].get('/user');
    const updatedBlockingMember = await members[1].get('/user');

    expect(response).to.eql({
      totalParticipants: 3,
      attemptedRecipients: 2,
      sent: 1,
      skipped: 1,
      skippedByReason: {
        notAuthorizedToSendMessageToThisUser: 1,
      },
    });
    expect(findInboxMessage(updatedAllowedMember, groupLeader._id)).to.exist;
    expect(findInboxMessage(updatedBlockingMember, groupLeader._id)).to.not.exist;
  });

  it('handles partial delivery when a participant has opted out of messaging', async () => {
    const { challenge, groupLeader, members } = await createChallengeSetup([
      {},
      { 'inbox.optOut': true },
    ]);

    const response = await groupLeader.post(`/challenges/${challenge._id}/message-participants`, {
      message: messageToSend,
    });

    const updatedAllowedMember = await members[0].get('/user');
    const updatedOptedOutMember = await members[1].get('/user');

    expect(response).to.eql({
      totalParticipants: 3,
      attemptedRecipients: 2,
      sent: 1,
      skipped: 1,
      skippedByReason: {
        notAuthorizedToSendMessageToThisUser: 1,
      },
    });
    expect(findInboxMessage(updatedAllowedMember, groupLeader._id)).to.exist;
    expect(findInboxMessage(updatedOptedOutMember, groupLeader._id)).to.not.exist;
  });

  it('rejects the whole request when the sender has chat privileges revoked', async () => {
    const { challenge, groupLeader, members } = await createChallengeSetup([{}]);
    await groupLeader.updateOne({ 'flags.chatRevoked': true });

    await expect(groupLeader.post(`/challenges/${challenge._id}/message-participants`, {
      message: messageToSend,
    })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('chatPrivilegesRevoked'),
    });

    const updatedMember = await members[0].get('/user');
    expect(findInboxMessage(updatedMember, groupLeader._id)).to.not.exist;
  });

  it('preserves mention highlighting', async () => {
    const { challenge, groupLeader, members } = await createChallengeSetup([{}]);

    await groupLeader.post(`/challenges/${challenge._id}/message-participants`, {
      message: `hi @${members[0].auth.local.username}`,
    });

    const updatedMember = await members[0].get('/user');
    const message = findInboxMessage(
      updatedMember,
      groupLeader._id,
      `hi [@${members[0].auth.local.username}](/profile/${members[0]._id})`,
    );

    expect(message).to.exist;
  });

  it('preserves shadow mute behavior through sentMessage', async () => {
    const { challenge, groupLeader, members } = await createChallengeSetup([{}]);
    await groupLeader.updateOne({ 'flags.chatShadowMuted': true });

    const response = await groupLeader.post(`/challenges/${challenge._id}/message-participants`, {
      message: messageToSend,
    });

    const updatedSender = await groupLeader.get('/user');
    const updatedMember = await members[0].get('/user');

    expect(response.sent).to.equal(1);
    expect(findInboxMessage(updatedMember, groupLeader._id)).to.not.exist;
    expect(findInboxMessage(updatedSender, members[0]._id)).to.exist;
  });
});
