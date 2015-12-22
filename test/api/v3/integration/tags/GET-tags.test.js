import {
  generateUser,
  requester,
} from '../../../../helpers/api-integration.helper';

describe('GET /tags', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('returns all user\'s tags', () => {
    return api.post('/tags', {name: 'Tag 1'})
    .then(() => api.post('/tags', {name: 'Tag 2'}))
    .then(() => api.get('/tags'))
    .then((tags) => {
      expect(tags.length).to.equal(2 + 3); // + 3 because 1 is a default task
      expect(tags[tags.length - 2].name).to.equal('Tag 1');
      expect(tags[tags.length - 1].name).to.equal('Tag 2');
    });
  });
});
