import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('PUT /tasks/:id', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  context('validates params', () => {
    let task;

    beforeEach(() => {
      // create sample task
      // task = createdTask
    });

    it(`ignores setting _id, type, userId, history, createdAt,
                        updatedAt, challenge, completed, streak,
                        dateCompleted fields`);

    it('ignores invalid fields');
  });

  context('habits', () => {
    let habit;

    beforeEach(() => {
      return api.post('/tasks', {
        text: 'test habit',
        type: 'habit',
        notes: 1976,
      }).then((createdHabit) => {
        habit = createdHabit;
      });
    });

    it('updates a habit', () => {
      return api.put(`/tasks/${habit._id}`, {
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
      return api.post('/tasks', {
        text: 'test todo',
        type: 'todo',
        notes: 1976,
      }).then((createdTodo) => {
        todo = createdTodo;
      });
    });

    it('updates a todo', () => {
      return api.put(`/tasks/${todo._id}`, {
        text: 'some new text',
        notes: 'some new notes',
      }).then((task) => {
        expect(task.text).to.eql('some new text');
        expect(task.notes).to.eql('some new notes');
      });
    });

    it('can update checklists'); // Can it?
    it('can update tags'); // Can it?
  });

  context('dailys', () => {
    let daily;

    beforeEach(() => {
      return api.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        notes: 1976,
      }).then((createdDaily) => {
        daily = createdDaily;
      });
    });

    it('updates a daily', () => {
      let now = new Date();

      return api.put(`/tasks/${daily._id}`, {
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

    it('can update checklists'); // Can it?
    it('can update tags'); // Can it?

    it('updates repeat, even if frequency is set to daily');

    it('updates everyX, even if frequency is set to weekly');

    it('defaults startDate to today if none date object is passed in');
  });

  context('rewards', () => {
    let reward;

    beforeEach(() => {
      return api.post('/tasks', {
        text: 'test reward',
        type: 'reward',
        notes: 1976,
        value: 10,
      }).then((createdReward) => {
        reward = createdReward;
      });
    });

    it('updates a reward', () => {
      return api.put(`/tasks/${reward._id}`, {
        text: 'some new text',
        notes: 'some new notes',
        value: 10,
      }).then((task) => {
        expect(task.text).to.eql('some new text');
        expect(task.notes).to.eql('some new notes');
        expect(task.value).to.eql(10);
      });
    });

    it('requires value to be coerced into a number');
  });
});
