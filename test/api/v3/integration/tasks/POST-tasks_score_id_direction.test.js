import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('POST /tasks/score/:id/:direction', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  context('all', () => {
    it('requires a task id', () => {
      return expect(api.post('/tasks/score/123/up')).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires a task direction', () => {
      return expect(api.post(`/tasks/score/${generateUUID()}/tt`)).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });

  context('todos', () => {
    let todo;

    beforeEach(() => {
      // todo = createdTodo
    });

    it('completes todo when direction is up');

    it('uncompletes todo when direction is down');

    it('scores up todo even if it is already completed'); // Yes?

    it('scores down todo even if it is already uncompleted'); // Yes?

    it('increases user\'s mp when direction is up');

    it('decreases user\'s mp when direction is down');

    it('increases user\'s exp when direction is up');

    it('decreases user\'s exp when direction is down');

    it('increases user\'s gold when direction is up');

    it('decreases user\'s gold when direction is down');
  });

  context('dailys', () => {
    let daily;

    beforeEach(() => {
      // daily = createdDaily
    });

    it('completes daily when direction is up');

    it('uncompletes daily when direction is down');

    it('scores up daily even if it is already completed'); // Yes?

    it('scores down daily even if it is already uncompleted'); // Yes?

    it('increases user\'s mp when direction is up');

    it('decreases user\'s mp when direction is down');

    it('increases user\'s exp when direction is up');

    it('decreases user\'s exp when direction is down');

    it('increases user\'s gold when direction is up');

    it('decreases user\'s gold when direction is down');
  });

  context('habits', () => {
    let habit, minusHabit, plusHabit, neitherHabit;

    beforeEach(() => {
      // habit = createdHabit
      // plusHabit = createdPlusHabit
      // minusHabit = createdMinusHabit
      // neitherHabit = createdNeitherHabit
    });

    it('prevents plus only habit from scoring down'); // Yes?

    it('prevents minus only habit from scoring up'); // Yes?

    it('increases user\'s mp when direction is up');

    it('decreases user\'s mp when direction is down');

    it('increases user\'s exp when direction is up');

    it('decreases user\'s exp when direction is down');

    it('increases user\'s gold when direction is up');

    it('decreases user\'s gold when direction is down');
  });

  context('reward', () => {
    let reward;

    beforeEach(() => {
      // reward = createdReward
    });

    it('purchases reward');

    it('does not change user\'s mp');

    it('does not change user\'s exp');

    it('does not allow a down direction');
  });
});
