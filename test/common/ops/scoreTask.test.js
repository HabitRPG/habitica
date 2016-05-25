import scoreTask from '../../../common/script/ops/scoreTask';
import {
  generateUser,
  generateDaily,
  generateHabit,
  generateTodo,
  generateReward,
} from '../../helpers/common.helper';
import common from '../../../common';
import i18n from '../../../common/script/i18n';
import {
  NotAuthorized,
} from '../../../common/script/libs/errors';

let EPSILON = 0.0001; // negligible distance between datapoints

/* Helper Functions */
let rewrapUser = (user) => {
  user._wrapped = false;
  common.wrap(user);
  return user;
};

let beforeAfter = () => {
  let beforeUser = generateUser();
  let afterUser = _.cloneDeep(beforeUser);
  rewrapUser(afterUser);

  return {
    beforeUser,
    afterUser,
  };
};

let expectGainedPoints = (beforeUser, afterUser, beforeTask, afterTask) => {
  expect(afterUser.stats.hp).to.eql(50);
  expect(afterUser.stats.exp).to.be.greaterThan(beforeUser.stats.exp);
  expect(afterUser.stats.gp).to.be.greaterThan(beforeUser.stats.gp);
  expect(afterTask.value).to.be.greaterThan(beforeTask.value);
  if (afterTask.type === 'habit') {
    expect(afterTask.history).to.have.length(1);
  }
};

let expectClosePoints = (beforeUser, afterUser, beforeTask, task) => {
  expect(Math.abs(afterUser.stats.exp - beforeUser.stats.exp)).to.be.lessThan(EPSILON);
  expect(Math.abs(afterUser.stats.gp - beforeUser.stats.gp)).to.be.lessThan(EPSILON);
  expect(Math.abs(task.value - beforeTask.value)).to.be.lessThan(EPSILON);
};

let _expectRoughlyEqualDates = (date1, date2) => {
  expect(date1.toString()).to.eql(date2.toString());
};

describe('shared.ops.scoreTask', () => {
  let ref;

  beforeEach(() => {
    ref = beforeAfter();
  });

  it('throws an error when scoring a reward if user does not have enough gold', (done) => {
    let reward = generateReward({ userId: ref.afterUser._id, text: 'some reward', value: 100 });
    try {
      scoreTask({ user: ref.afterUser, task: reward });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.eql(i18n.t('messageNotEnoughGold'));
      done();
    }
  });

  it('checks that the streak parameters affects the score', () => {
    let task = generateDaily({ userId: ref.afterUser._id, text: 'task to check streak' });
    scoreTask({ user: ref.afterUser, task, direction: 'up', cron: false });
    scoreTask({ user: ref.afterUser, task, direction: 'up', cron: false });
    expect(task.streak).to.eql(2);
  });

  it('completes when the task direction is up', () => {
    let task = generateTodo({ userId: ref.afterUser._id, text: 'todo to complete', cron: false });
    scoreTask({ user: ref.afterUser, task, direction: 'up' });
    expect(task.completed).to.eql(true);
    _expectRoughlyEqualDates(task.dateCompleted, new Date());
  });

  it('uncompletes when the task direction is down', () => {
    let task = generateTodo({ userId: ref.afterUser._id, text: 'todo to complete', cron: false });
    scoreTask({ user: ref.afterUser, task, direction: 'down' });
    expect(task.completed).to.eql(false);
    expect(task.dateCompleted).to.not.exist;
  });

  describe('verifies that times parameter in scoring works', () => {
    let habit;

    beforeEach(() => {
      ref = beforeAfter();
      habit = generateHabit({ userId: ref.afterUser._id, text: 'some habit' });
    });

    it('works', () => {
      let delta1, delta2, delta3;

      delta1 = scoreTask({ user: ref.afterUser, task: habit, direction: 'up', times: 5, cron: false });

      ref = beforeAfter();
      habit = generateHabit({ userId: ref.afterUser._id, text: 'some habit' });

      delta2 = scoreTask({ user: ref.afterUser, task: habit, direction: 'up', times: 4, cron: false });

      ref = beforeAfter();
      habit = generateHabit({ userId: ref.afterUser._id, text: 'some habit' });

      delta3 = scoreTask({ user: ref.afterUser, task: habit, direction: 'up', times: 5, cron: false });

      expect(Math.abs(delta1 - delta2)).to.be.greaterThan(EPSILON);
      expect(Math.abs(delta1 - delta3)).to.be.lessThan(EPSILON);
    });
  });

  describe('scores', () => {
    let options = {};
    let habit;
    let freshDaily, daily;
    let freshTodo, todo;

    beforeEach(() => {
      ref = beforeAfter(options);
      habit = generateHabit({ userId: ref.afterUser._id, text: 'some habit' });
      freshDaily = generateDaily({ userId: ref.afterUser._id, text: 'some daily' });
      daily = generateDaily({ userId: ref.afterUser._id, text: 'some daily' });
      freshTodo = generateTodo({ userId: ref.afterUser._id, text: 'some todo' });
      todo = generateTodo({ userId: ref.afterUser._id, text: 'some todo' });

      expect(habit.history.length).to.eql(0);

      // before and after are the same user
      expect(ref.beforeUser._id).to.exist;
      expect(ref.beforeUser._id).to.eql(ref.afterUser._id);
    });

    context('habits', () => {
      it('up', () => {
        options = { user: ref.afterUser, task: habit, direction: 'up', times: 5, cron: false };
        scoreTask(options);

        expect(habit.history.length).to.eql(1);
        expect(habit.value).to.be.greaterThan(0);

        expect(ref.afterUser.stats.hp).to.eql(50);
        expect(ref.afterUser.stats.exp).to.be.greaterThan(ref.beforeUser.stats.exp);
        expect(ref.afterUser.stats.gp).to.be.greaterThan(ref.beforeUser.stats.gp);
      });

      it('down', () => {
        scoreTask({user: ref.afterUser, task: habit, direction: 'down', times: 5, cron: false}, {});

        expect(habit.history.length).to.eql(1);
        expect(habit.value).to.be.lessThan(0);

        expect(ref.afterUser.stats.hp).to.be.lessThan(ref.beforeUser.stats.hp);
        expect(ref.afterUser.stats.exp).to.eql(0);
        expect(ref.afterUser.stats.gp).to.eql(0);
      });
    });

    context('dailys', () => {
      it('up', () => {
        expect(daily.completed).to.not.eql(true);
        scoreTask({user: ref.afterUser, task: daily, direction: 'up'});
        expectGainedPoints(ref.beforeUser, ref.afterUser, freshDaily, daily);
        expect(daily.completed).to.eql(true);
      });

      it('up, down', () => {
        scoreTask({user: ref.afterUser, task: daily, direction: 'up'});
        scoreTask({user: ref.afterUser, task: daily, direction: 'down'});
        expectClosePoints(ref.beforeUser, ref.afterUser, freshDaily, daily);
      });

      it('sets completed = false on direction = down', () => {
        daily.completed = true;
        expect(daily.completed).to.not.eql(false);
        scoreTask({user: ref.afterUser, task: daily, direction: 'down'});
        expect(daily.completed).to.eql(false);
      });
    });

    context('todos', () => {
      it('up', () => {
        scoreTask({user: ref.afterUser, task: todo, direction: 'up'});
        expectGainedPoints(ref.beforeUser, ref.afterUser, freshTodo, todo);
      });

      it('up, down', () => {
        scoreTask({user: ref.afterUser, task: todo, direction: 'up'});
        scoreTask({user: ref.afterUser, task: todo, direction: 'down'});
        expectClosePoints(ref.beforeUser, ref.afterUser, freshTodo, todo);
      });
    });
  });
});
