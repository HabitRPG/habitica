import {
  createAndPopulateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /groups/:id/chat/:id/flag', () => {

  context('another member\'s message', () => {
    let group, member, message, user;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
        members: 1,
      }).then((res) => {
        group = res.group;
        user = res.leader;
        member = res.members[0];

        return requester(member)
          .post(`/groups/${group._id}/chat`, null, { message: 'Group member message', });
      }).then((res) => {
        message = res.message;
      });
    });

    it('flags message', () => {
      let api = requester(user);

      return api.post(`/groups/${group._id}/chat/${message.id}/flag`).then((messages) => {
        return api.get(`/groups/${group._id}/chat`);
      }).then((messages) => {
        let message = messages[0];
        expect(message.flagCount).to.eql(1);
      });
    });

    it('cannot flag the same message twice', () => {
      let api = requester(user);

      return expect(api.post(`/groups/${group._id}/chat/${message.id}/flag`).then((messages) => {
        return api.post(`/groups/${group._id}/chat/${message.id}/flag`);
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageGroupChatFlagAlreadyReported'),
      });
    });
  });

  context('own message', () => {
    let api, group, message, user;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
          members: 1,
        },
      }).then((res) => {
        group = res.group;
        user = res.leader;
        api = requester(user);

        return api.post(`/groups/${group._id}/chat`, null, { message: 'User\'s own message', });
      }).then((res) => {
        message = res.message;
      });
    });

    it('cannot flag message', () => {
      let api = requester(user);

      return expect(api.post(`/groups/${group._id}/chat/${message.id}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('messageGroupChatFlagOwnMessage'),
        });
    });
  });

  context('nonexistant message', () => {
    let api, group, message, user;

    beforeEach(() => {
      return createAndPopulateGroup({
        groupDetails: {
          type: 'guild',
          privacy: 'public',
        },
      }).then((res) => {
        group = res.group;
        user = res.leader;
        api = requester(user);
      });
    });

    it('returns error', () => {
      let api = requester(user);

      return expect(api.post(`/groups/${group._id}/chat/non-existant-message/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          text: t('messageGroupChatNotFound'),
        });
    });
  });

  context('group with multiple messages', () => {
    let admin, author, group, member, message, user;

    beforeEach(() => {
      return generateUser().then((user) => {
        author = user;

        return createAndPopulateGroup({
          groupDetails: {
            type: 'guild',
            privacy: 'public',
            chat: [
              { id: 'message-to-be-flagged', uuid: author._id, flagCount: 0, flags: {} },
              { id: '1-flag-message', uuid: author._id, flagCount: 1, flags: { 'id1': true } },
              { id: '2-flag-message', uuid: author._id, flagCount: 2, flags: { 'id1': true, 'id2': true } },
              { id: 'no-flags', uuid: author._id, flagCount: 0, flags: {} },
            ],
          },
          members: 1,
        });
      }).then((res) => {
        group = res.group;
        user = res.leader;
        member = res.members[0];
        return generateUser({
          'contributor.admin': true,
        });
      }).then((user) => {
        admin = user;
      });
    });

    it('changes only the message that is flagged', () => {
      let api = requester(user);

      return api.post(`/groups/${group._id}/chat/message-to-be-flagged/flag`).then((messages) => {
        return requester(admin).get(`/groups/${group._id}/chat`);
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

    beforeEach(() => {
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
        user = res.leader;
        member = res.members[0];

        return requester(member)
          .post(`/groups/${group._id}/chat`, null, { message: 'Group member message', });
      }).then((res) => {
        message = res.message;
      });
    });

    it('sets flagCount to 5', () => {
      let api = requester(user);

      return api.post(`/groups/${group._id}/chat/${message.id}/flag`).then((messages) => {
        return api.get(`/groups/${group._id}/chat`);
      }).then((messages) => {
        let message = messages[0];
        expect(message.flagCount).to.eql(5);
      });
    });
  });
});
