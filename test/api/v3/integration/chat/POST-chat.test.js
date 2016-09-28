import {
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /chat', () => {
  let user, groupWithChat, member, additionalMember;
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

  it('Returns an error when group is not found', async () => {
    await expect(user.post('/groups/invalidID/chat', { message: testMessage})).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('groupNotFound'),
    });
  });

  it('Returns an error when chat privileges are revoked', async () => {
    let userWithChatRevoked = await member.update({'flags.chatRevoked': true});
    await expect(userWithChatRevoked.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage})).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: 'Your chat privileges have been revoked.',
    });
  });

  it('creates a chat', async () => {
    let message = await user.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage});

    expect(message.message.id).to.exist;
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

  it('Returns an error when the user has been posting too many messages', async () => {
    // Post 4 messages which is the limit for spam
    for (let i = 0; i < 4; i++) {
      let result = await additionalMember.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage }); // eslint-disable-line babel/no-await-in-loop
      expect(result.message.id).to.exist;
    }

    await expect(additionalMember.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage })).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('messageGroupChatSpam'),
    });
  });

  it('contributor should not receive spam alert', async () => {
    let userSocialite = await member.update({'contributor.level': 4, 'flags.chatRevoked': false});

    // Post 5 messages which is 1 more than the limit for spam
    for (let i = 0; i < 5; i++) {
      let result = await userSocialite.post(`/groups/${groupWithChat._id}/chat`, { message: testMessage }); // eslint-disable-line babel/no-await-in-loop
      expect(result.message.id).to.exist;
    }
  });
});
