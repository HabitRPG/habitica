import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('PUT /tags/:tagId', () => {
  let user;
  let updatedTagName = 'Tag updated';

  before(async () => {
    user = await generateUser();
  });

  it('updates a tag given it\'s id', async () => {
    let createdTag = await user.post('/tags', {name: 'Tag 1'});
    let updatedTag = await user.put(`/tags/${createdTag._id}`, {
      name: updatedTagName,
      ignored: true,
    });

    createdTag = await user.get(`/tags/${updatedTag._id}`);

    expect(updatedTag.name).to.equal(updatedTagName);
    expect(updatedTag.ignored).to.be.undefined;

    expect(createdTag.name).to.equal(updatedTagName);
    expect(createdTag.ignored).to.be.undefined;
  });
});
