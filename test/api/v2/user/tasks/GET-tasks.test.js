import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('GET /user/tasks/', () => {
  let api, user;

  beforeEach(() => {
    return generateUser({
      dailys: [
        {text: 'daily', type: 'daily'},
        {text: 'daily', type: 'daily'},
        {text: 'daily', type: 'daily'},
        {text: 'daily', type: 'daily'},
      ],
    }).then((_user) => {
      user = _user;
      api = requester(user);
    });
  });

  it('gets all tasks', () => {
    return api.get(`/user/tasks/`).then((tasks) => {
      expect(tasks).to.be.an('array');
      expect(tasks.length).to.be.greaterThan(3);

      let task = tasks[0];
      expect(task.id).to.exist;
      expect(task.type).to.exist;
      expect(task.text).to.exist;
    });
  });
});
