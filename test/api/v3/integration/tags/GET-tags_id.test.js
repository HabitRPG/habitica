import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('GET /tags/:tagId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns a tag given it\'s id', async () => {
    let createdTag = await user.post('/tags', {name: 'Tag 1'});
    let tag = await user.get(`/tags/${createdTag._id}`);

    expect(tag).to.deep.equal(createdTag);
  });
});
