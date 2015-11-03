import {
  createAndPopulateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /groups/:id/chat/:id/like', () => {

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

    it('likes message', () => {
      let api = requester(user);

      return api.post(`/groups/${group._id}/chat/${message.id}/like`).then((messages) => {
        let message = messages[0];
        expect(message.likes[user._id]).to.eql(true);
      });
    });

    it('returns the message object', () => {
      let api = requester(user);

      return api.post(`/groups/${group._id}/chat/${message.id}/like`).then((messages) => {
        let message = messages[0];
        expect(message.text).to.eql('Group member message');
        expect(message.uuid).to.eql(member._id);
        expect(message.user).to.eql(member.profile.name);
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

    it('cannot like message', () => {
      let api = requester(user);

      return expect(api.post(`/groups/${group._id}/chat/${message.id}/like`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('messageGroupChatLikeOwnMessage'),
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

      return expect(api.post(`/groups/${group._id}/chat/non-existant-message/like`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          text: t('messageGroupChatNotFound'),
        });
    });
  });
});
