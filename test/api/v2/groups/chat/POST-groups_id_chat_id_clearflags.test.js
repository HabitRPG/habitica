import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /groups/:id/chat/:id/clearflags', () => {
  let group;

  beforeEach(() => {
    return createAndPopulateGroup({
      groupDetails: {
        type: 'guild',
        privacy: 'public',
        members: 1,
        flagCount: 1,
        chat: [{
          id: 'message-to-clear',
          flagCount: 1,
          flags: { 'some-id': true },
        }],
      },
    }).then((res) => {
      group = res.group;
    });
  });

  context('non admin', () => {
    let nonadmin;

    beforeEach(() => {
      return generateUser().then((user) => {
        nonadmin = user;
      });
    });

    it('cannot clear flags', () => {
      return expect(nonadmin.post(`/groups/${group._id}/chat/message-to-clear/clearflags`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('messageGroupChatAdminClearFlagCount'),
        });
    });
  });

  context('admin', () => {
    let admin;

    beforeEach(() => {
      return generateUser({
        'contributor.admin': true,
      }).then((user) => {
        admin = user;
      });
    });

    it('clears flags', () => {
      return admin.post(`/groups/${group._id}/chat/message-to-clear/clearflags`).then((res) => {
        return admin.get(`/groups/${group._id}/chat`);
      }).then((messages) => {
        expect(messages[0].flagCount).to.eql(0);
      });
    });

    it('leaves old flags on the flag object', () => {
      return admin.post(`/groups/${group._id}/chat/message-to-clear/clearflags`).then((res) => {
        return admin.get(`/groups/${group._id}/chat`);
      }).then((messages) => {
        expect(messages[0].flags).to.have.property('some-id', true);
      });
    });

    it('returns error if message does not exist', () => {
      return expect(admin.post(`/groups/${group._id}/chat/non-existant-message/clearflags`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          text: t('messageGroupChatNotFound'),
        });
    });
  });

  context('admin user, group with multiple messages', () => {
    let admin, author, group, member;

    beforeEach(() => {
      return generateUser().then((user) => {
        author = user;

        return createAndPopulateGroup({
          groupDetails: {
            type: 'guild',
            privacy: 'public',
            chat: [
              { id: 'message-to-unflag', uuid: author._id, flagCount: 1, flags: {'some-user': true} },
              { id: '1-flag-message', uuid: author._id, flagCount: 1, flags: { 'id1': true } },
              { id: '2-flag-message', uuid: author._id, flagCount: 2, flags: { 'id1': true, 'id2': true } },
              { id: 'no-flags', uuid: author._id, flagCount: 0, flags: {} },
            ],
          },
          members: 1,
        });
      }).then((res) => {
        group = res.group;
        return generateUser({
          'contributor.admin': true,
        });
      }).then((user) => {
        admin = user;
      });
    });

    it('changes only the message that is flagged', () => {
      return admin.post(`/groups/${group._id}/chat/message-to-unflag/clearflags`).then((messages) => {
        return admin.get(`/groups/${group._id}/chat`);
      }).then((messages) => {
        expect(messages).to.have.lengthOf(4);

        let messageThatWasUnflagged = messages[0];
        let messageWith1Flag = messages[1];
        let messageWith2Flag = messages[2];
        let messageWithoutFlags = messages[3];

        expect(messageThatWasUnflagged.flagCount).to.eql(0);
        expect(messageThatWasUnflagged.flags).to.have.property('some-user', true);

        expect(messageWith1Flag.flagCount).to.eql(1);
        expect(messageWith1Flag.flags).to.have.property('id1', true);

        expect(messageWith2Flag.flagCount).to.eql(2);
        expect(messageWith2Flag.flags).to.have.property('id1', true);

        expect(messageWithoutFlags.flagCount).to.eql(0);
        expect(messageWithoutFlags.flags).to.eql({});
      });
    });
  });
});
