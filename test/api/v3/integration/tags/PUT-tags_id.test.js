import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('PUT /tags/:tagId', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('updates a tag given it\'s id', () => {
    return user.post('/tags', {name: 'Tag 1'})
    .then((createdTag) => {
      return user.put(`/tags/${createdTag._id}`, {
        name: 'Tag updated',
        ignored: true,
      });
    })
    .then((updatedTag) => {
      expect(updatedTag.name).to.equal('Tag updated');
      expect(updatedTag.ignored).to.be.a('undefined');

      return user.get(`/tags/${updatedTag._id}`);
    })
    .then((tag) => {
      expect(tag.name).to.equal('Tag updated');
      expect(tag.ignored).to.be.a('undefined');
    });
  });
});
