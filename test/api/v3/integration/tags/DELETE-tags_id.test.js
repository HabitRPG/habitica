import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('DELETE /tags/:tagId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('deletes a tag given it\'s id', async () => {
    const tagName = 'Tag 1';
    const tag = await user.post('/tags', { name: tagName });
    const numberOfTags = (await user.get('/tags')).length;

    await user.del(`/tags/${tag.id}`);

    const tags = await user.get('/tags');
    const tagNames = tags.map(t => t.name);

    expect(tags.length).to.equal(numberOfTags - 1);
    expect(tagNames).to.not.include(tagName);
  });
});
