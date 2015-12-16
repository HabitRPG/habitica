import {
  generateUser,
  requester,
} from '../../../../helpers/api-integration.helper';

describe('POST /tags', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('creates a tag correctly', () => {
    let createdTag;

    return api.post('/tags', {
      name: 'Tag 1',
      ignored: false,
    }).then((tag) => {
      createdTag = tag;
      expect(tag.name).to.equal('Tag 1');
      expect(tag.ignored).to.be.a('undefined');
      return api.get(`/tags/${createdTag._id}`)
    })
    .then((tag) => {
      expect(tag).to.deep.equal(createdTag);
    });
  });
});
