import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';
import Q from 'q';

describe('POST /tasks/:id/score/:direction', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  context('all', () => {
    it('requires a task id', () => {
      return expect(api.post('/tasks/123/score/up')).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires a task direction', () => {
      return expect(api.post(`/tasks/${generateUUID()}/score/tt`)).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });

  context('todos', () => {
    let todo;

    beforeEach(() => {
      return api.post('/tasks', {
        text: 'test todo',
        type: 'todo',
      }).then((task) => {
        todo = task;
      });
    });

    it('completes todo when direction is up', () => {
      return api.post(`/tasks/${todo._id}/score/up`)
      .then((res) => api.get(`/tasks/${todo._id}`))
      .then((task) => expect(task.completed).to.equal(true));
    });

    it('uncompletes todo when direction is down', () => {
      return api.post(`/tasks/${todo._id}/score/down`)
      .then((res) => api.get(`/tasks/${todo._id}`))
      .then((updatedTask) => {
        expect(updatedTask.completed).to.equal(false);
      });
    });

    it('scores up todo even if it is already completed'); // Yes?

    it('scores down todo even if it is already uncompleted'); // Yes?

    it('increases user\'s mp when direction is up', () => {
      return api.post(`/tasks/${todo._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp < updatedUser.stats.mp).to.equal(true);
        user = updatedUser;
      });
    });

    it('decreases user\'s mp when direction is down', () => {
      return api.post(`/tasks/${todo._id}/score/down`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp > updatedUser.stats.mp).to.equal(true);
        user = updatedUser;
      });
    });

    it('increases user\'s exp when direction is up', () => {
      return api.post(`/tasks/${todo._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.exp < updatedUser.stats.exp).to.equal(true);
        user = updatedUser;
      });
    });

    it('decreases user\'s exp when direction is down', () => {
      return api.post(`/tasks/${todo._id}/score/down`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.exp > updatedUser.stats.exp).to.equal(true);
        user = updatedUser;
      });
    });

    it('increases user\'s gold when direction is up', () => {
      return api.post(`/tasks/${todo._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.gp < updatedUser.stats.gp).to.equal(true);
        user = updatedUser;
      });
    });

    it('decreases user\'s gold when direction is down', () => {
      return api.post(`/tasks/${todo._id}/score/down`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.gp > updatedUser.stats.gp).to.equal(true);
        user = updatedUser;
      });
    });
  });

  context('dailys', () => {
    let daily;

    beforeEach(() => {
      return api.post('/tasks', {
        text: 'test daily',
        type: 'daily',
      }).then((task) => {
        daily = task;
      });
    });

    it('completes daily when direction is up', () => {
      return api.post(`/tasks/${daily._id}/score/up`)
      .then((res) => api.get(`/tasks/${daily._id}`))
      .then((task) => expect(task.completed).to.equal(true));
    });

    it('uncompletes daily when direction is down', () => {
      return api.post(`/tasks/${daily._id}/score/down`)
      .then((res) => api.get(`/tasks/${daily._id}`))
      .then((task) => expect(task.completed).to.equal(false));
    });

    it('scores up daily even if it is already completed'); // Yes?

    it('scores down daily even if it is already uncompleted'); // Yes?

    it('increases user\'s mp when direction is up', () => {
      return api.post(`/tasks/${daily._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp < updatedUser.stats.mp).to.equal(true);
        user = updatedUser;
      });
    });

    it('decreases user\'s mp when direction is down', () => {
      return api.post(`/tasks/${daily._id}/score/down`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp > updatedUser.stats.mp).to.equal(true);
        user = updatedUser;
      });
    });

    it('increases user\'s exp when direction is up', () => {
      return api.post(`/tasks/${daily._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.exp < updatedUser.stats.exp).to.equal(true);
        user = updatedUser;
      });
    });

    it('decreases user\'s exp when direction is down', () => {
      return api.post(`/tasks/${daily._id}/score/down`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.exp > updatedUser.stats.exp).to.equal(true);
        user = updatedUser;
      });
    });

    it('increases user\'s gold when direction is up', () => {
      return api.post(`/tasks/${daily._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.gp < updatedUser.stats.gp).to.equal(true);
        user = updatedUser;
      });
    });

    it('decreases user\'s gold when direction is down', () => {
      return api.post(`/tasks/${daily._id}/score/down`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.gp > updatedUser.stats.gp).to.equal(true);
        user = updatedUser;
      });
    });
  });

  context('habits', () => {
    let habit, minusHabit, plusHabit, neitherHabit;

    beforeEach(() => {
      return api.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      }).then((task) => {
        habit = task;
        return api.post('/tasks', {
          text: 'test min habit',
          type: 'habit',
          up: false,
        });
      }).then((task) => {
        minusHabit = task;
        return api.post('/tasks', {
          text: 'test plus habit',
          type: 'habit',
          down: false,
        })
      }).then((task) => {
        plusHabit = task;
        api.post('/tasks', {
          text: 'test neither habit',
          type: 'habit',
          up: false,
          down: false,
        })
      }).then((task) => {
        neitherHabit = task;
      });
    });

    it('prevents plus only habit from scoring down'); // Yes?

    it('prevents minus only habit from scoring up'); // Yes?

    it('increases user\'s mp when direction is up', () => {
      return api.post(`/tasks/${habit._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp < updatedUser.stats.mp).to.equal(true);
        user = updatedUser;
      });
    });

    it('decreases user\'s mp when direction is down', () => {
      return api.post(`/tasks/${habit._id}/score/down`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp > updatedUser.stats.mp).to.equal(true);
        user = updatedUser;
      });
    });

    it('increases user\'s exp when direction is up', () => {
      return api.post(`/tasks/${habit._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.exp < updatedUser.stats.exp).to.equal(true);
        user = updatedUser;
      });
    });

    it('decreases user\'s exp when direction is down', () => {
      return api.post(`/tasks/${habit._id}/score/down`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.exp > updatedUser.stats.exp).to.equal(true);
        user = updatedUser;
      });
    });

    it('increases user\'s gold when direction is up', () => {
      return api.post(`/tasks/${habit._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.gp < updatedUser.stats.gp).to.equal(true);
        user = updatedUser;
      });
    });

    it('decreases user\'s gold when direction is down', () => {
      return api.post(`/tasks/${habit._id}/score/down`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.gp > updatedUser.stats.gp).to.equal(true);
        user = updatedUser;
      });
    });
  });

  context('reward', () => {
    let reward;

    beforeEach(() => {
      return api.post('/tasks', {
        text: 'test reward',
        type: 'reward',
        value: 5,
      }).then((task) => {
        reward = task;
      });
    });

    it('purchases reward', () => {
      return api.post(`/tasks/${reward._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.hp).to.equal(updatedUser.stats.mp + 5);
        user = updatedUser;
      });
    });

    it('does not change user\'s mp', () => {
      return api.post(`/tasks/${reward._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp).to.equal(updatedUser.stats.mp);
        user = updatedUser;
      });
    });

    it('does not change user\'s exp', () => {
      return api.post(`/tasks/${reward._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.exp).to.equal(updatedUser.stats.exp);
        user = updatedUser;
      });
    });

    it('does not allow a down direction', () => {
      return api.post(`/tasks/${reward._id}/score/up`)
      .then((res) => api.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp).to.equal(updatedUser.stats.mp);
        user = updatedUser;
      });
    });
  });
});
