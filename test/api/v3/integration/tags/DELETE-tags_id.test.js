import {
  generateUser,
} from '../../../../helpers/api-integration.helper';

describe('DELETE /tags/:tagId', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  it('deletes a tag given it\'s id', () => {
    let length;
    let tag;

    return user.post('/tags', {name: 'Tag 1'})
    .then((createdTag) => {
      tag = createdTag;
      return user.get(`/tags`);
    })
    .then((tags) => {
      length = tags.length;
      return user.del(`/tags/${tag._id}`);
    })
    .then(() => user.get(`/tags`))
    .then((tags) => {
      expect(tags.length).to.equal(length - 1);
      expect(tags[tags.length - 1].name).to.not.equal('Tag 1');
    });
  });
});
