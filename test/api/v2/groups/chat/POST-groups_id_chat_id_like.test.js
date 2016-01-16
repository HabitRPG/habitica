import {
  createAndPopulateGroup,
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v2';

describe('POST /groups/:id/chat/:id/like', () => {
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

    it('likes message', async () => {
      return user.post(`/groups/${group._id}/chat/${message.id}/like`).then((messages) => {
        expect(messages[0].likes[user._id]).to.eql(true);
      });
    });

    it('returns the message object', async () => {
      return user.post(`/groups/${group._id}/chat/${message.id}/like`).then((messages) => {
        expect(messages[0].text).to.eql('Group member message');
        expect(messages[0].uuid).to.eql(member._id);
        expect(messages[0].user).to.eql(member.profile.name);
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

    it('cannot like message', async () => {
      return expect(user.post(`/groups/${group._id}/chat/${message.id}/like`))
        .to.eventually.be.rejected.and.eql({
          code: 401,
          text: t('messageGroupChatLikeOwnMessage'),
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
            { id: 'message-to-be-liked', likes: {}, uuid: author._id, flagCount: 0, flags: {} },
            { id: '1-like-message', likes: { id: true }, uuid: author._id, flagCount: 1, flags: { id1: true } },
            { id: '2-like-message', likes: { id: true, id2: true }, uuid: author._id, flagCount: 2, flags: { id1: true, id2: true } },
            { id: 'no-likes', likes: {}, uuid: author._id, flagCount: 0, flags: {} },
          ],
        },
        members: 1,
      });

      group = groupData.group;
      user = groupData.groupLeader;
    });

    it('changes only the message that is liked', async () => {
      return user.post(`/groups/${group._id}/chat/message-to-be-liked/like`).then(() => {
        return admin.get(`/groups/${group._id}/chat`);
      }).then((messages) => {
        expect(messages).to.have.lengthOf(4);

        let messageThatWasLiked = messages[0];
        let messageWith1Like = messages[1];
        let messageWith2Like = messages[2];
        let messageWithoutLike = messages[3];

        expect(messageThatWasLiked.likes).to.have.property(user._id, true);

        expect(messageWith1Like.flagCount).to.eql(1);
        expect(messageWith1Like.flags).to.have.property('id1', true);

        expect(messageWith2Like.flagCount).to.eql(2);
        expect(messageWith2Like.flags).to.have.property('id1', true);
        expect(messageWith2Like.flags).to.have.property('id2', true);

        expect(messageWithoutLike.flagCount).to.eql(0);
        expect(messageWithoutLike.flags).to.eql({});
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
      return expect(user.post(`/groups/${group._id}/chat/non-existant-message/like`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          text: t('messageGroupChatNotFound'),
        });
    });
  });
});
