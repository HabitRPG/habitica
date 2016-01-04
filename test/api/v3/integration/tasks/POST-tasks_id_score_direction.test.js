import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/:id/score/:direction', () => {
  let user;

  beforeEach(() => {
    return generateUser({
      'stats.gp': 100,
    }).then((generatedUser) => {
      user = generatedUser;
    });
  });

  context('all', () => {
    it('requires a task id', () => {
      return expect(user.post('/tasks/123/score/up')).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires a task direction', () => {
      return expect(user.post(`/tasks/${generateUUID()}/score/tt`)).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });

  context('todos', () => {
    let todo;

    beforeEach(() => {
      return user.post('/tasks?tasksOwner=user', {
        text: 'test todo',
        type: 'todo',
      }).then((task) => {
        todo = task;
      });
    });

    it('completes todo when direction is up', () => {
      return user.post(`/tasks/${todo._id}/score/up`)
      .then(() => user.get(`/tasks/${todo._id}`))
      .then((task) => expect(task.completed).to.equal(true));
    });

    it('moves completed todos out of user.tasksOrder.todos', () => {
      return user.get('/user')
      .then(usr => {
        expect(usr.tasksOrder.todos.indexOf(todo._id)).to.not.equal(-1);
      }).then(() => user.post(`/tasks/${todo._id}/score/up`))
      .then(() => user.get(`/tasks/${todo._id}`))
      .then((updatedTask) => {
        expect(updatedTask.completed).to.equal(true);
        return user.get('/user');
      })
      .then((usr) => {
        expect(usr.tasksOrder.todos.indexOf(todo._id)).to.equal(-1);
      });
    });

    it('moves un-completed todos back into user.tasksOrder.todos', () => {
      return user.get('/user')
      .then(usr => {
        expect(usr.tasksOrder.todos.indexOf(todo._id)).to.not.equal(-1);
      }).then(() => user.post(`/tasks/${todo._id}/score/up`))
      .then(() => user.post(`/tasks/${todo._id}/score/down`))
      .then(() => user.get(`/tasks/${todo._id}`))
      .then((updatedTask) => {
        expect(updatedTask.completed).to.equal(false);
        return user.get('/user');
      })
      .then((usr) => {
        let l = usr.tasksOrder.todos.length;
        expect(usr.tasksOrder.todos.indexOf(todo._id)).not.to.equal(-1);
        expect(usr.tasksOrder.todos.indexOf(todo._id)).to.equal(l - 1); // Check that it was pushed at the bottom
      });
    });

    it('uncompletes todo when direction is down', () => {
      return user.post(`/tasks/${todo._id}/score/down`)
      .then(() => user.get(`/tasks/${todo._id}`))
      .then((updatedTask) => {
        expect(updatedTask.completed).to.equal(false);
      });
    });

    it('scores up todo even if it is already completed'); // Yes?

    it('scores down todo even if it is already uncompleted'); // Yes?

    it('increases user\'s mp when direction is up', () => {
      return user.post(`/tasks/${todo._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.mp).to.be.greaterThan(user.stats.mp);
      });
    });

    it('decreases user\'s mp when direction is down', () => {
      return user.post(`/tasks/${todo._id}/score/down`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.mp).to.be.lessThan(user.stats.mp);
      });
    });

    it('increases user\'s exp when direction is up', () => {
      return user.post(`/tasks/${todo._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.exp).to.be.greaterThan(user.stats.exp);
      });
    });

    it('decreases user\'s exp when direction is down', () => {
      return user.post(`/tasks/${todo._id}/score/down`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.exp).to.be.lessThan(user.stats.exp);
      });
    });

    it('increases user\'s gold when direction is up', () => {
      return user.post(`/tasks/${todo._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.gp).to.be.greaterThan(user.stats.gp);
      });
    });

    it('decreases user\'s gold when direction is down', () => {
      return user.post(`/tasks/${todo._id}/score/down`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.gp).to.be.lessThan(user.stats.gp);
      });
    });
  });

  context('dailys', () => {
    let daily;

    beforeEach(() => {
      return user.post('/tasks?tasksOwner=user', {
        text: 'test daily',
        type: 'daily',
      }).then((task) => {
        daily = task;
      });
    });

    it('completes daily when direction is up', () => {
      return user.post(`/tasks/${daily._id}/score/up`)
      .then(() => user.get(`/tasks/${daily._id}`))
      .then((task) => expect(task.completed).to.equal(true));
    });

    it('uncompletes daily when direction is down', () => {
      return user.post(`/tasks/${daily._id}/score/down`)
      .then(() => user.get(`/tasks/${daily._id}`))
      .then((task) => expect(task.completed).to.equal(false));
    });

    it('scores up daily even if it is already completed'); // Yes?

    it('scores down daily even if it is already uncompleted'); // Yes?

    it('increases user\'s mp when direction is up', () => {
      return user.post(`/tasks/${daily._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.mp).to.be.greaterThan(user.stats.mp);
      });
    });

    it('decreases user\'s mp when direction is down', () => {
      return user.post(`/tasks/${daily._id}/score/down`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.mp).to.be.lessThan(user.stats.mp);
      });
    });

    it('increases user\'s exp when direction is up', () => {
      return user.post(`/tasks/${daily._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.exp).to.be.greaterThan(user.stats.exp);
      });
    });

    it('decreases user\'s exp when direction is down', () => {
      return user.post(`/tasks/${daily._id}/score/down`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.exp).to.be.lessThan(user.stats.exp);
      });
    });

    it('increases user\'s gold when direction is up', () => {
      return user.post(`/tasks/${daily._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.gp).to.be.greaterThan(user.stats.gp);
      });
    });

    it('decreases user\'s gold when direction is down', () => {
      return user.post(`/tasks/${daily._id}/score/down`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.gp).to.be.lessThan(user.stats.gp);
      });
    });
  });

  context('habits', () => {
    let habit, minusHabit, plusHabit, neitherHabit; // eslint-disable-line no-unused-vars

    beforeEach(() => {
      return user.post('/tasks?tasksOwner=user', {
        text: 'test habit',
        type: 'habit',
      }).then((task) => {
        habit = task;
        return user.post('/tasks?tasksOwner=user', {
          text: 'test min habit',
          type: 'habit',
          up: false,
        });
      }).then((task) => {
        minusHabit = task;
        return user.post('/tasks?tasksOwner=user', {
          text: 'test plus habit',
          type: 'habit',
          down: false,
        });
      }).then((task) => {
        plusHabit = task;
        user.post('/tasks?tasksOwner=user', {
          text: 'test neither habit',
          type: 'habit',
          up: false,
          down: false,
        });
      }).then((task) => {
        neitherHabit = task;
      });
    });

    it('prevents plus only habit from scoring down'); // Yes?

    it('prevents minus only habit from scoring up'); // Yes?

    it('increases user\'s mp when direction is up', () => {
      return user.post(`/tasks/${habit._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.mp).to.be.greaterThan(user.stats.mp);
      });
    });

    it('decreases user\'s mp when direction is down', () => {
      return user.post(`/tasks/${habit._id}/score/down`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.mp).to.be.lessThan(user.stats.mp);
      });
    });

    it('increases user\'s exp when direction is up', () => {
      return user.post(`/tasks/${habit._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.exp).to.be.greaterThan(user.stats.exp);
      });
    });

    it('increases user\'s gold when direction is up', () => {
      return user.post(`/tasks/${habit._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(updatedUser.stats.gp).to.be.greaterThan(user.stats.gp);
      });
    });
  });

  context('reward', () => {
    let reward;

    beforeEach(() => {
      return user.post('/tasks?tasksOwner=user', {
        text: 'test reward',
        type: 'reward',
        value: 5,
      }).then((task) => {
        reward = task;
      });
    });

    it('purchases reward', () => {
      return user.post(`/tasks/${reward._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.gp).to.equal(updatedUser.stats.gp + 5);
      });
    });

    it('does not change user\'s mp', () => {
      return user.post(`/tasks/${reward._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp).to.equal(updatedUser.stats.mp);
      });
    });

    it('does not change user\'s exp', () => {
      return user.post(`/tasks/${reward._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.exp).to.equal(updatedUser.stats.exp);
      });
    });

    it('does not allow a down direction', () => {
      return user.post(`/tasks/${reward._id}/score/up`)
      .then(() => user.get(`/user`))
      .then((updatedUser) => {
        expect(user.stats.mp).to.equal(updatedUser.stats.mp);
      });
    });
  });
});
