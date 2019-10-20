import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /groups/:groupId/chat', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  context('public Guild', () => {
    let group;

    before(async () => {
      const leader = await generateUser({ balance: 2 });

      group = await generateGroup(leader, {
        name: 'test group',
        type: 'guild',
        privacy: 'public',
      }, {
        chat: [
          { text: 'Hello', flags: {}, id: 1 },
          { text: 'Welcome to the Guild', flags: {}, id: 2 },
        ],
      });
    });

    it('returns Guild chat', async () => {
      const chat = await user.get(`/groups/${group._id}/chat`);

      expect(chat[0].id).to.eql(group.chat[0].id);
      expect(chat[1].id).to.eql(group.chat[1].id);
    });
  });

  context('private Guild', () => {
    let group;

    before(async () => {
      const leader = await generateUser({ balance: 2 });

      group = await generateGroup(leader, {
        name: 'test group',
        type: 'guild',
        privacy: 'private',
      }, {
        chat: [
          'Hello',
          'Welcome to the Guild',
        ],
      });
    });

    it('returns error if user is not member of requested private group', async () => {
      await expect(user.get(`/groups/${group._id}/chat`)).to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('groupNotFound'),
      });
    });
  });
});
