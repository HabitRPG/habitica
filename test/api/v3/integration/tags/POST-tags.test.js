import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /tags', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('creates a tag correctly', async () => {
    let tagName = 'Tag 1';
    let createdTag = await user.post('/tags', {
      name: tagName,
      ignored: false,
    });

    let tag = await user.get(`/tags/${createdTag._id}`);

    expect(tag.name).to.equal(tagName);
    expect(tag.ignored).to.not.exist;
    expect(tag).to.deep.equal(createdTag);
  });
});
