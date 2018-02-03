import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('DELETE /tags/:tagId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('deletes a tag given it\'s id', async () => {
    let tagName = 'Tag 1';
    let tag = await user.post('/tags', {name: tagName});
    let numberOfTags = (await user.get('/tags')).length;

    await user.del(`/tags/${tag.id}`);

    let tags = await user.get('/tags');
    let tagNames = tags.map((t) => {
      return t.name;
    });

    expect(tags.length).to.equal(numberOfTags - 1);
    expect(tagNames).to.not.include(tagName);
  });
});
