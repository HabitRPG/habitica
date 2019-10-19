import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /tags', () => {
  let user;

  before(async () => {
    user = await generateUser({
      tags: [],
    });
  });

  it('returns all user\'s tags', async () => {
    const tag1 = await user.post('/tags', { name: 'Tag 1' });
    const tag2 = await user.post('/tags', { name: 'Tag 2' });

    const tags = await user.get('/tags');

    expect(tags.length).to.equal(2);
    expect(tags[0].name).to.equal(tag1.name);
    expect(tags[1].name).to.equal(tag2.name);
  });
});
