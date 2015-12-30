import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('POST /tags', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('creates a tag correctly', () => {
    let createdTag;

    return user.post('/tags', {
      name: 'Tag 1',
      ignored: false,
    }).then((tag) => {
      createdTag = tag;

      expect(tag.name).to.equal('Tag 1');
      expect(tag.ignored).to.be.a('undefined');

      return user.get(`/tags/${createdTag._id}`);
    })
    .then((tag) => {
      expect(tag).to.deep.equal(createdTag);
    });
  });
});
