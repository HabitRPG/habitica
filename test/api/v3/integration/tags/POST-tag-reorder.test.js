import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /reorder-tags', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns error when no parameters are provided', async () => {
    await expect(user.post('/reorder-tags'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('updates tags', async () => {
    let tag1Name = 'Tag 1';
    let tag2Name = 'Tag 2';
    await user.post('/tags', {name: tag1Name});
    await user.post('/tags', {name: tag2Name});
    await user.sync();

    await user.post('/reorder-tags', {tagId: user.tags[4].id, to: 3});
    await user.sync();

    expect(user.tags[3].name).to.equal(tag2Name);
    expect(user.tags[4].name).to.equal(tag1Name);
  });
});
