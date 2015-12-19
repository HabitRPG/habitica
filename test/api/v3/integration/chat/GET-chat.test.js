import {
  createAndPopulateGroup,
  generateUser,
  generateGroup,
  requester,
} from '../../../../helpers/api-integration.helper';

describe('GET /groups/:groupId/chat', () => {
  let user, api;

  before(() => {
    return generateUser({balance: 2}).then((generatedUser) => {
      user = generatedUser;
      console.log(user._id, user.balance)
      api = requester(user);
    });
  });

  context('public Guild', () => {
    let group;

    before(() => {
      return generateGroup(user, {
        name: 'test group',
        type: 'guild',
        privacy: 'public',
        chat: [
          'Hello',
          'Welcome to the Guild',
        ],
      })
      .then((createdGroup) => {
        group = createdGroup;
      });
    });

    it('returns Guild chat', () => {
      return api.get('/groups/' + group._id + '/chat')
      .then((getChat) => {
        expect(getChat).to.eql(group.chat);
      });
    });
  });
});
