import {
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration.helper';

describe('GET /user/tags/id', () => {
  let api, user;

  beforeEach(() => {
    return generateUser().then((usr) => {
      user = usr;
      api = requester(usr);
    });
  });

  it('gets a user\'s tag by id', () => {
    return expect(api.get('/user/tags/' + user.tags[0].id))
      .to.eventually.eql(user.tags[0]);
  });

  it('fails for non-existent tags', () => {
    return expect(api.get('/user/tags/not-an-id'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        text: t('messageTagNotFound'),
      });
  });
});
