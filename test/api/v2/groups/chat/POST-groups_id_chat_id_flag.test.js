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
