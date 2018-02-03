import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /reorder-tags', () => {
  let user;

  before(async () => {
    user = await generateUser({
      tags: [],
    });
  });

  it('returns error when no parameters are provided', async () => {
    await expect(user.post('/reorder-tags'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('returns error when tag is not found', async () => {
    await expect(user.post('/reorder-tags', {tagId: 'fake-id', to: 3}))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('tagNotFound'),
      });
  });

  it('updates tags', async () => {
    let tag1Name = 'Tag 1';
    let tag2Name = 'Tag 2';
    await user.post('/tags', {name: tag1Name});
    await user.post('/tags', {name: tag2Name});
    await user.sync();

    await user.post('/reorder-tags', {tagId: user.tags[0].id, to: 1});
    await user.sync();

    expect(user.tags[0].name).to.equal(tag2Name);
    expect(user.tags[1].name).to.equal(tag1Name);
  });
});
