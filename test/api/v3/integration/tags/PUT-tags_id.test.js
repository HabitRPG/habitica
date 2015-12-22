import {
  generateUser,
  requester,
} from '../../../../helpers/api-integration.helper';

describe('PUT /tags/:tagId', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('updates a tag given it\'s id', () => {
    let length;

    return api.post('/tags', {name: 'Tag 1'})
    .then((createdTag) => {
      return api.put(`/tags/${createdTag._id}`, {
        name: 'Tag updated',
        ignored: true
      });
    })
    .then((updatedTag) => {
      expect(updatedTag.name).to.equal('Tag updated');
      expect(updatedTag.ignored).to.be.a('undefined');
      return api.get(`/tags/${updatedTag._id}`);
    })
    .then((tag) => {
      expect(tag.name).to.equal('Tag updated');
      expect(tag.ignored).to.be.a('undefined');
    });
  });
});
