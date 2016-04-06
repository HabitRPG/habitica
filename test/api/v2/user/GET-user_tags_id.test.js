import {
  generateUser,
  translate as t,
} from '../../../helpers/api-integration/v2';

describe('GET /user/tags/id', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('gets a user\'s tag by id', async () => {
    return expect(user.get(`/user/tags/${user.tags[0].id}`))
      .to.eventually.eql(user.tags[0]);
  });

  it('fails for non-existent tags', async () => {
    return expect(user.get('/user/tags/not-an-id'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        text: t('messageTagNotFound'),
      });
  });
});
