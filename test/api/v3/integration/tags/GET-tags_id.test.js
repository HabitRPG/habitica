import {
  generateUser,
  requester,
} from '../../../../helpers/api-integration.helper';

describe('GET /tags/:tagId', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('returns a tag given it\'s id', () => {
    let createdTag;

    return api.post('/tags', {name: 'Tag 1'})
    .then((tag) => {
      createdTag = tag;
      return api.get(`/tags/${createdTag._id}`)
    })
    .then((tag) => {
      expect(tag).to.deep.equal(createdTag);
    });
  });
});
