import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('GET /tags/:tagId', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('returns a tag given it\'s id', () => {
    let createdTag;

    return user.post('/tags', {name: 'Tag 1'})
    .then((tag) => {
      createdTag = tag;
      return user.get(`/tags/${createdTag._id}`)
    })
    .then((tag) => {
      expect(tag).to.deep.equal(createdTag);
    });
  });
});
