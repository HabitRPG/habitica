import {
  generateUser,
  requester,
} from '../../../helpers/api-integration.helper';

describe('GET /user/tags', () => {
  let api, user;

  beforeEach(() => {
    return generateUser().then((usr) => {
      user = usr;
      api = requester(usr);
    });
  });

  it('gets the user\'s tags', () => {
    return expect(api.get('/user/tags'))
      .to.eventually.eql(user.tags);
  });
});
