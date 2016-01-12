import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('GET /tags', () => {
  let user;
  let tagName1 = 'Tag 1';
  let tagName2 = 'Tag 2';

  before(async () => {
    user = await generateUser();
  });

  it('returns all user\'s tags', async () => {
    await user.post('/tags', {name: tagName1});
    await user.post('/tags', {name: tagName2});

    let tags = await user.get('/tags');

    expect(tags.length).to.equal(2 + 3); // + 3 because 1 is a default task
    expect(tags[tags.length - 2].name).to.equal(tagName1);
    expect(tags[tags.length - 1].name).to.equal(tagName2);
  });
});
