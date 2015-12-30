import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('GET /tags', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('returns all user\'s tags', () => {
    return user.post('/tags', {name: 'Tag 1'})
    .then(() => user.post('/tags', {name: 'Tag 2'}))
    .then(() => user.get('/tags'))
    .then((tags) => {
      expect(tags.length).to.equal(2 + 3); // + 3 because 1 is a default task
      expect(tags[tags.length - 2].name).to.equal('Tag 1');
      expect(tags[tags.length - 1].name).to.equal('Tag 2');
    });
  });
});
