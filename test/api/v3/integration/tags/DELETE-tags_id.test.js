import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('DELETE /tags/:tagId', () => {
  let user;
  let tagName = 'Tag 1';

  before(async () => {
    user = await generateUser();
  });

  it('deletes a tag given it\'s id', async () => {
    let tag = await user.post('/tags', {name: tagName});
    let tags = await user.get('/tags');
    let length = tags.length;

    await user.del(`/tags/${tag._id}`);

    tags = await user.get('/tags');
    let tagNames = tags.map((t) => {
      return t.name;
    });

    expect(tags.length).to.equal(length - 1);
    expect(tagNames).to.not.include(tagName);
  });
});
