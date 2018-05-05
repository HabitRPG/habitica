import {
  generateUser,
  generateGroup,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';

describe('GET /groups/:groupId/chat', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  context('public Guild', () => {
    let group;

    before(async () => {
      let leader = await generateUser({balance: 2});

      group = await generateGroup(leader, {
        name: 'test group',
        type: 'guild',
        privacy: 'public',
      }, {
        chat: [
          {text: 'Hello', flags: {}},
          {text: 'Welcome to the Guild', flags: {}},
        ],
      });
    });

    it('returns Guild chat', async () => {
      let chat = await user.get(`/groups/${group._id}/chat`);

      expect(chat).to.eql(group.chat);
    });
  });

  context('private Guild', () => {
    let group;

    before(async () => {
      let leader = await generateUser({balance: 2});

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
