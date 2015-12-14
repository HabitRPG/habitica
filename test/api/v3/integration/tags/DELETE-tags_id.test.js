import {
  generateUser,
  requester,
} from '../../../../helpers/api-integration.helper';

describe('DELETE /tags/:tagId', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('deletes a tag given it\'s id', () => {
    let length;
    let tag;

    return api.post('/tags', {name: 'Tag 1'})
    .then((createdTag) => {
      tag = createdTag;
      return api.get(`/tags`);
    })
    .then((tags) => {
      length = tags.length;
      return api.del(`/tags/${tag._id}`);
    })
    .then(() => api.get(`/tags`))
    .then((tags) => {
      expect(tags.length).to.equal(length - 1);
      expect(tags[tags.length - 1].name).to.not.equal('Tag 1');
    });
  });
});
