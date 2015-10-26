import {
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('PUT /user', () => {
  let api, user;

  beforeEach(() => {
    return generateUser().then((usr) => {
      user = usr;
      api = requester(user);
    });
  });

  it('updates the user', () => {
    return api.put('/user', {
      'profile.name' : 'Frodo',
    }).then((updatedUser) => {
      expect(updatedUser.profile.name).to.eql('Frodo');
    });
  });
});
