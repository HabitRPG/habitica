import {
  generateUser,
} from '../../../helpers/api-integration/v2';

describe('GET /user/tags', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('gets the user\'s tags', async () => {
    return expect(user.get('/user/tags'))
      .to.eventually.eql(user.tags);
  });
});
