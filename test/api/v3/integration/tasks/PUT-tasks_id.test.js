import {
  generateUser,
} from '../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('PUT /tasks/:id', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  context('validates params', () => {
    let task;

    beforeEach(() => {
      return user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      }).then((createdTask) => {
        task = createdTask;
      });
    });

    it(`ignores setting _id, type, userId, history, createdAt,
                        updatedAt, challenge, completed, streak,
                        dateCompleted fields`, () => {
      user.put(`/tasks/${task._id}`, {
        _id: 123,
        type: 'daily',
        userId: 123,
        history: [123],
        createdAt: 'yesterday',
        updatedAt: 'tomorrow',
        challenge: 'no',
        completed: true,
        streak: 25,
        dateCompleted: 'never',
      }).then((savedTask) => {
        expect(savedTask._id).to.equal(task._id);
        expect(savedTask.type).to.equal(task.type);
        expect(savedTask.userId).to.equal(user._id);
        expect(savedTask.history).to.eql([]);
        expect(savedTask.createdAt).not.to.equal('yesterday');
        expect(savedTask.updatedAt).not.to.equal('tomorrow');
        expect(savedTask.challenge).not.to.equal('no');
        expect(savedTask.completed).to.equal(false);
        expect(savedTask.streak).to.equal(0);
        expect(savedTask.streak).not.to.equal('never');
      });
    });

    it('ignores invalid fields', () => {
      user.put(`/tasks/${task._id}`, {
        notValid: true,
      }).then((savedTask) => {
        expect(savedTask.notValid).to.be.a('undefined');
      });
    });
  });

  context('habits', () => {
    let habit;

    beforeEach(() => {
      return user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
        notes: 1976,
      }).then((createdHabit) => {
        habit = createdHabit;
      });
    });

    it('updates a habit', () => {
      return user.put(`/tasks/${habit._id}`, {
        text: 'some new text',
        up: false,
        down: false,
        notes: 'some new notes',
      }).then((task) => {
        expect(task.text).to.eql('some new text');
        expect(task.notes).to.eql('some new notes');
        expect(task.up).to.eql(false);
        expect(task.down).to.eql(false);
      });
    });
  });

  context('todos', () => {
    let todo;

    beforeEach(() => {
      return user.post('/tasks', {
        text: 'test todo',
        type: 'todo',
        notes: 1976,
      }).then((createdTodo) => {
        todo = createdTodo;
      });
    });

    it('updates a todo', () => {
      return user.put(`/tasks/${todo._id}`, {
        text: 'some new text',
        notes: 'some new notes',
      }).then((task) => {
        expect(task.text).to.eql('some new text');
        expect(task.notes).to.eql('some new notes');
      });
    });

    it('can update checklists (replace it)', () => {
      return user.put(`/tasks/${todo._id}`, {
        checklist: [
          {text: 123, completed: false},
          {text: 456, completed: true},
        ],
      }).then(() => {
        return user.put(`/tasks/${todo._id}`, {
          checklist: [
            {text: 789, completed: false},
          ],
        });
      }).then((savedTodo2) => {
        expect(savedTodo2.checklist.length).to.equal(1);
        expect(savedTodo2.checklist[0].text).to.equal('789');
        expect(savedTodo2.checklist[0].completed).to.equal(false);
      });
    });

    it('can update tags (replace them)', () => {
      let finalUUID = generateUUID();
      return user.put(`/tasks/${todo._id}`, {
        tags: [generateUUID(), generateUUID()],
      }).then(() => {
        return user.put(`/tasks/${todo._id}`, {
          tags: [finalUUID],
        });
      }).then((savedTodo2) => {
        expect(savedTodo2.tags.length).to.equal(1);
        expect(savedTodo2.tags[0]).to.equal(finalUUID);
      });
    });
  });

  context('dailys', () => {
    let daily;

    beforeEach(() => {
      return user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        notes: 1976,
      }).then((createdDaily) => {
        daily = createdDaily;
      });
    });

    it('updates a daily', () => {
      return user.put(`/tasks/${daily._id}`, {
        text: 'some new text',
        notes: 'some new notes',
        frequency: 'daily',
        everyX: 5,
      }).then((task) => {
        expect(task.text).to.eql('some new text');
        expect(task.notes).to.eql('some new notes');
        expect(task.frequency).to.eql('daily');
        expect(task.everyX).to.eql(5);
      });
    });

    it('can update checklists (replace it)', () => {
      return user.put(`/tasks/${daily._id}`, {
        checklist: [
          {text: 123, completed: false},
          {text: 456, completed: true},
        ],
      }).then(() => {
        return user.put(`/tasks/${daily._id}`, {
          checklist: [
            {text: 789, completed: false},
          ],
        });
      }).then((savedDaily2) => {
        expect(savedDaily2.checklist.length).to.equal(1);
        expect(savedDaily2.checklist[0].text).to.equal('789');
        expect(savedDaily2.checklist[0].completed).to.equal(false);
      });
    });

    it('can update tags (replace them)', () => {
      let finalUUID = generateUUID();
      return user.put(`/tasks/${daily._id}`, {
        tags: [generateUUID(), generateUUID()],
      }).then(() => {
        return user.put(`/tasks/${daily._id}`, {
          tags: [finalUUID],
        });
      }).then((savedDaily2) => {
        expect(savedDaily2.tags.length).to.equal(1);
        expect(savedDaily2.tags[0]).to.equal(finalUUID);
      });
    });

    it('updates repeat, even if frequency is set to daily', () => {
      return user.put(`/tasks/${daily._id}`, {
        frequency: 'daily',
      }).then(() => {
        return user.put(`/tasks/${daily._id}`, {
          repeat: {
            m: false,
            su: false,
          },
        });
      }).then((savedDaily2) => {
        expect(savedDaily2.repeat).to.eql({
          m: false,
          t: true,
          w: true,
          th: true,
          f: true,
          s: true,
          su: false,
        });
      });
    });

    it('updates everyX, even if frequency is set to weekly', () => {
      return user.put(`/tasks/${daily._id}`, {
        frequency: 'weekly',
      }).then(() => {
        return user.put(`/tasks/${daily._id}`, {
          everyX: 5,
        });
      }).then((savedDaily2) => {
        expect(savedDaily2.everyX).to.eql(5);
      });
    });

    it('defaults startDate to today if none date object is passed in', () => {
      return user.put(`/tasks/${daily._id}`, {
        frequency: 'weekly',
      }).then((savedDaily2) => {
        expect((new Date(savedDaily2.startDate)).getDay()).to.eql((new Date()).getDay());
      });
    });
  });

  context('rewards', () => {
    let reward;

    beforeEach(() => {
      return user.post('/tasks', {
        text: 'test reward',
        type: 'reward',
        notes: 1976,
        value: 10,
      }).then((createdReward) => {
        reward = createdReward;
      });
    });

    it('updates a reward', () => {
      return user.put(`/tasks/${reward._id}`, {
        text: 'some new text',
        notes: 'some new notes',
        value: 10,
      }).then((task) => {
        expect(task.text).to.eql('some new text');
        expect(task.notes).to.eql('some new notes');
        expect(task.value).to.eql(10);
      });
    });

    it('requires value to be coerced into a number', () => {
      return user.put(`/tasks/${reward._id}`, {
        value: '100',
      }).then((task) => {
        expect(task.value).to.eql(100);
      });
    });
  });
});
