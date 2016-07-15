import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('GET /tags', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns all user\'s tags', async () => {
    let tag1 = await user.post('/tags', {name: 'Tag 1'});
    let tag2 = await user.post('/tags', {name: 'Tag 2'});

    let tags = await user.get('/tags');

    expect(tags.length).to.equal(2 + 3); // + 3 because 1 is a default task
    expect(tags[tags.length - 2].name).to.equal(tag1.name);
    expect(tags[tags.length - 1].name).to.equal(tag2.name);
  });
});
