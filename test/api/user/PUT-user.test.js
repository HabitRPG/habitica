import {
  generateUser,
  requester,
} from '../../helpers/api.helper';

describe('PUT /user', () => {
  let api, user;
  
  beforeEach((done) => {
    generateUser().then((usr) => {
      user = usr;
      api = requester(usr);
      done();
    }).catch(done);
  });
  
  it("updates the user", () => {
    let api = requester(user);
    return api.get('/user')
    .then((fetchedUser) => {  
      return api.put("/user", {"profile.name" : "Frodo"});
    })
    .then((updatedUser) => {
      expect(updatedUser.profile.name).to.eql("Frodo");
    });
  });
});