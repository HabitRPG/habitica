import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('GET /tasks', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  it('returns all user\'s tasks');
});
