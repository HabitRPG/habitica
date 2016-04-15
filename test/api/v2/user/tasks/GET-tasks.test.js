import {
  generateUser,
} from '../../../../helpers/api-integration/v2';

describe('GET /user/tasks/', () => {
  let user;

  beforeEach(async () => {
    return generateUser().then((_user) => {
      user = _user;
    });
  });

  it('gets all tasks', async () => {
    return user.get('/user/tasks/').then((tasks) => {
      expect(tasks).to.be.an('array');
      expect(tasks.length).to.equal(1);

      let task = tasks[0];
      expect(task.id).to.exist;
      expect(task.type).to.exist;
      expect(task.text).to.exist;
    });
  });
});
