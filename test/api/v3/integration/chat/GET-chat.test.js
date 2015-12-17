import {
  createAndPopulateGroup,
  generateUser,
  requester,
} from '../../../../helpers/api-integration.helper';

describe.only('GET /groups/:groupId/chat', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  context('public Guild', () => {
    let group;

    before(() => {
      return createAndPopulateGroup({groupDetails: {
        type: 'guild',
        privacy: 'public',
        chat: [
          'Hello',
          'Welcome to the Guild',
        ],
      }})
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
