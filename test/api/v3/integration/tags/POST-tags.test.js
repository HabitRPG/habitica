import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('POST /tags', () => {
  let user;
  let tagName = 'Tag 1';

  before(async () => {
    user = await generateUser();
  });

  it('creates a tag correctly', async () => {
    let createdTag = await user.post('/tags', {
      name: tagName,
      ignored: false,
    });

    let tag = await user.get(`/tags/${createdTag._id}`);

    expect(tag.name).to.equal(tagName);
    expect(tag.ignored).to.be.undefined;
    expect(tag).to.deep.equal(createdTag);
  });
});
