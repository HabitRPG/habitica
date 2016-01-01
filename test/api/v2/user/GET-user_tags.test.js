import {
  generateUser,
} from '../../../helpers/api-integration.helper';

describe('GET /user/tags', () => {
  let user;

  beforeEach(async () => {
    return generateUser().then((usr) => {
      user = usr;
    });
  });

  it('gets the user\'s tags', async () => {
    return expect(user.get('/user/tags'))
      .to.eventually.eql(user.tags);
  });
});
