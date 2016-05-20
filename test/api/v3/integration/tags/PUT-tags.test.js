import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('PUT /tags', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns error when no parameters are provided', async () => {
    await expect(user.put('/tags'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Invalid request parameters.',
      });
  });

  it('updates tags', async () => {
    let updatedTagName = 'Tag updated';
    let tag1Name = 'Tag 1';
    await user.post('/tags', {name: tag1Name});
    await user.post('/tags', {name: 'Tag 2'});
    await user.sync();

    //  Swap, we use 3 and 4 because morning, afternoon and evening tags are automatically added
    let tmp = user.tags[3];
    user.tags[3] = user.tags[4];
    user.tags[4] = tmp;
    user.tags[3].name = updatedTagName;

    await user.put('/tags', {tags: user.tags});
    await user.sync();

    expect(user.tags[3].name).to.equal(updatedTagName);
    expect(user.tags[4].name).to.equal(tag1Name);
  });
});
