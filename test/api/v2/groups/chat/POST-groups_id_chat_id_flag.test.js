import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v2';

describe('POST /groups/:id/chat/:id/flag', () => {
  context('another member\'s message', () => {
    let group, member, message, user;

    beforeEach(async () => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 1,
      }).then((res) => {
        group = res.group;
        user = res.groupLeader;
        member = res.members[0];

        return member.post(`/groups/${group._id}/chat`, null, { message: 'Group member message' });
      }).then((res) => {
        message = res.message;
      });
    });

    it('flags message', async () => {
      return user.post(`/groups/${group._id}/chat/${message.id}/flag`).then(() => {
        return user.get(`/groups/${group._id}/chat`);
      }).then((messages) => {
        expect(messages[0].flagCount).to.eql(1);
      });
    });

    it('cannot flag the same message twice', async () => {
      return expect(user.post(`/groups/${group._id}/chat/${message.id}/flag`).then(() => {
        return user.post(`/groups/${group._id}/chat/${message.id}/flag`);
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageGroupChatFlagAlreadyReported'),
      });
    });
  });

  context('own message', () => {
    let group, message, user;

    beforeEach(async () => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
          members: 1,
        },
      }).then((res) => {
        group = res.group;
        user = res.groupLeader;

        return user.post(`/groups/${group._id}/chat`, null, { message: 'User\'s own message' });
      }).then((res) => {
        message = res.message;
      });
    });

    it('cannot flag message', async () => {
      return expect(user.post(`/groups/${group._id}/chat/${message.id}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('messageGroupChatFlagOwnMessage'),
        });
    });
  });

  context('nonexistant message', () => {
    let group, user;

    beforeEach(async () => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        group = res.group;
        user = res.groupLeader;
      });
    });

    it('returns error', async () => {
      return expect(user.post(`/groups/${group._id}/chat/non-existant-message/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          text: t('messageGroupChatNotFound'),
        });
    });
  });

  context('group with multiple messages', () => {
    let admin, author, group, user;

    beforeEach(async () => {
      author = await generateUser();
      admin = await generateUser({
        'contributor.admin': true,
      });

      let groupData = await createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
          chat: [
            { id: 'message-to-be-flagged', uuid: author._id, flagCount: 0, flags: {} },
            { id: '1-flag-message', uuid: author._id, flagCount: 1, flags: { id1: true } },
            { id: '2-flag-message', uuid: author._id, flagCount: 2, flags: { id1: true, id2: true } },
            { id: 'no-flags', uuid: author._id, flagCount: 0, flags: {} },
          ],
        },
        members: 1,
      });

      group = groupData.group;
      user = groupData.groupLeader;
    });

    it('changes only the message that is flagged', async () => {
      return user.post(`/groups/${group._id}/chat/message-to-be-flagged/flag`).then(() => {
        return admin.get(`/groups/${group._id}/chat`);
      }).then((messages) => {
        expect(messages).to.have.lengthOf(4);

        let messageThatWasFlagged = messages[0];
        let messageWith1Flag = messages[1];
        let messageWith2Flag = messages[2];
        let messageWithoutFlags = messages[3];

        expect(messageThatWasFlagged.flagCount).to.eql(1);
        expect(messageThatWasFlagged.flags).to.have.property(user._id, true);

        expect(messageWith1Flag.flagCount).to.eql(1);
        expect(messageWith1Flag.flags).to.have.property('id1', true);

        expect(messageWith2Flag.flagCount).to.eql(2);
        expect(messageWith2Flag.flags).to.have.property('id1', true);

        expect(messageWithoutFlags.flagCount).to.eql(0);
        expect(messageWithoutFlags.flags).to.eql({});
      });
    });
  });

  context('admin flagging a message', () => {
    let group, member, message, user;

    beforeEach(async () => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        leaderDetails: {
          'contributor.admin': true,
          balance: 10,
        },
        members: 1,
      }).then((res) => {
        group = res.group;
        user = res.groupLeader;
        member = res.members[0];

        return member.post(`/groups/${group._id}/chat`, null, { message: 'Group member message' });
      }).then((res) => {
        message = res.message;
      });
    });

    it('sets flagCount to 5', async () => {
      return user.post(`/groups/${group._id}/chat/${message.id}/flag`).then(() => {
        return user.get(`/groups/${group._id}/chat`);
      }).then((messages) => {
        expect(messages[0].flagCount).to.eql(5);
      });
    });
  });
});
