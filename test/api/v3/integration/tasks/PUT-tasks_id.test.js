import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { v4 as generateRandomUserName } from 'uuid';
import { each } from 'lodash';

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

    it('returns an error if req.body.type is not valid', () => {
      return expect(api.put(`/tasks/${task._id}`, {
        type: 'habitF',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('ignores setting userId field');

    it('ignores setting history field');

    it('ignores setting createdAt field');

    it('ignores setting updatedAt field');

    it('ignores setting challenge field');

    it('ignores setting value field');

    it('ignores setting completed field');

    it('ignores setting streak field');

    it('ignores setting dateCompleted field');

    it('ignores invalid fields');
  });

  context('habits', () => {
    let habit;

    beforeEach(() => {
      // create existing habit
      // habit = createdHabit;
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
      // create existing todo
      // todo = createdTodo;
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
  });

  context('dailys', () => {
    let daily;

    beforeEach(() => {
      // create existing daily
      // daily = createdDaily;
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

    it('updates repeat, even if frequency is set to daily');

    it('updates everyX, even if frequency is set to weekly');

    it('defaults startDate to today if none date object is passed in');
  });

  context('rewards', () => {
    let reward;

    beforeEach(() => {
      // create existing reward
      // reward = createdReward;
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
