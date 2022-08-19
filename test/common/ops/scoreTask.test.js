import scoreTask from '../../../website/common/script/ops/scoreTask';

import {
  generateUser,
  generateDaily,
  generateHabit,
  generateTodo,
  generateReward,
} from '../../helpers/common.helper';
import i18n from '../../../website/common/script/i18n';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';
import crit from '../../../website/common/script/fns/crit';
import shared from '../../../website/common/script';

const EPSILON = 0.0001; // negligible distance between datapoints

const beforeAfter = () => {
  const beforeUser = generateUser();
  const afterUser = _.cloneDeep(beforeUser);

  return {
    beforeUser,
    afterUser,
  };
};

const expectGainedPoints = (beforeUser, afterUser, beforeTask, afterTask) => {
  expect(afterUser.stats.hp).to.eql(50);
  expect(afterUser.stats.exp).to.be.greaterThan(beforeUser.stats.exp);
  expect(afterUser.stats.gp).to.be.greaterThan(beforeUser.stats.gp);
  expect(afterTask.value).to.be.greaterThan(beforeTask.value);
  if (afterTask.type === 'habit') {
    expect(afterTask.history).to.have.length(1);
  }
};

const expectClosePoints = (beforeUser, afterUser, beforeTask, task) => {
  expect(Math.abs(afterUser.stats.exp - beforeUser.stats.exp)).to.be.lessThan(EPSILON);
  expect(Math.abs(afterUser.stats.gp - beforeUser.stats.gp)).to.be.lessThan(EPSILON);
  expect(Math.abs(task.value - beforeTask.value)).to.be.lessThan(EPSILON);
};

function expectRoughlyEqualDates (date1, date2) {
  date1 = date1.valueOf(); // eslint-disable-line no-param-reassign
  date2 = date2.valueOf(); // eslint-disable-line no-param-reassign
  expect(date1).to.be.within(date2 - 100, date2 + 100);
}

describe('shared.ops.scoreTask', () => {
  let ref;

  beforeEach(() => {
    ref = beforeAfter();
  });

  it('throws an error when scoring a reward if user does not have enough gold', done => {
    const reward = generateReward({ userId: ref.afterUser._id, text: 'some reward', value: 100 });
    try {
      scoreTask({ user: ref.afterUser, task: reward });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.eql(i18n.t('messageNotEnoughGold'));
      done();
    }
  });

  it('completes when the task direction is up', () => {
    const task = generateTodo({ userId: ref.afterUser._id, text: 'todo to complete', cron: false });
    scoreTask({ user: ref.afterUser, task, direction: 'up' });
    expect(task.completed).to.eql(true);
    expectRoughlyEqualDates(task.dateCompleted, new Date());
  });

  it('uncompletes when the task direction is down', () => {
    const task = generateTodo({ userId: ref.afterUser._id, text: 'todo to complete', cron: false });
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
      const delta1 = scoreTask({
        user: ref.afterUser, task: habit, direction: 'up', times: 5, cron: false,
      });

      ref = beforeAfter();
      habit = generateHabit({ userId: ref.afterUser._id, text: 'some habit' });

      const delta2 = scoreTask({
        user: ref.afterUser, task: habit, direction: 'up', times: 4, cron: false,
      });

      ref = beforeAfter();
      habit = generateHabit({ userId: ref.afterUser._id, text: 'some habit' });

      const delta3 = scoreTask({
        user: ref.afterUser, task: habit, direction: 'up', times: 5, cron: false,
      });

      expect(Math.abs(delta1 - delta2)).to.be.greaterThan(EPSILON);
      expect(Math.abs(delta1 - delta3)).to.be.lessThan(EPSILON);
    });
  });

  it('checks that the streak parameters affects the score', () => {
    const task = generateDaily({ userId: ref.afterUser._id, text: 'task to check streak' });
    scoreTask({
      user: ref.afterUser, task, direction: 'up', cron: false,
    });
    scoreTask({
      user: ref.afterUser, task, direction: 'up', cron: false,
    });
    expect(task.streak).to.eql(2);
  });

  describe('verifies that 21-day streak achievements are given/removed correctly', () => {
    const initialStreakCount = 20; // 1 before the streak achievement is awarded
    beforeEach(() => {
      ref = beforeAfter();
    });

    it('awards the first streak achievement', () => {
      const task = generateDaily({ userId: ref.afterUser._id, text: 'some daily', streak: initialStreakCount });
      scoreTask({ user: ref.afterUser, task, direction: 'up' });
      expect(ref.afterUser.achievements.streak).to.equal(1);
    });

    it('increments the streak achievement for a second streak', () => {
      const task1 = generateDaily({ userId: ref.afterUser._id, text: 'first daily', streak: initialStreakCount });
      scoreTask({ user: ref.afterUser, task: task1, direction: 'up' });
      const task2 = generateDaily({ userId: ref.afterUser._id, text: 'second daily', streak: initialStreakCount });
      scoreTask({ user: ref.afterUser, task: task2, direction: 'up' });
      expect(ref.afterUser.achievements.streak).to.equal(2);
    });

    it('removes the first streak achievement when unticking a Daily', () => {
      const task = generateDaily({ userId: ref.afterUser._id, text: 'some daily', streak: initialStreakCount });
      scoreTask({ user: ref.afterUser, task, direction: 'up' });
      scoreTask({ user: ref.afterUser, task, direction: 'down' });
      expect(ref.afterUser.achievements.streak).to.equal(0);
    });

    it('decrements a multiple streak achievement when unticking a Daily', () => {
      const task1 = generateDaily({ userId: ref.afterUser._id, text: 'first daily', streak: initialStreakCount });
      scoreTask({ user: ref.afterUser, task: task1, direction: 'up' });
      const task2 = generateDaily({ userId: ref.afterUser._id, text: 'second daily', streak: initialStreakCount });
      scoreTask({ user: ref.afterUser, task: task2, direction: 'up' });
      scoreTask({ user: ref.afterUser, task: task2, direction: 'down' });
      expect(ref.afterUser.achievements.streak).to.equal(1);
    });

    it('does not give a streak achievement for a streak of zero', () => {
      const task = generateDaily({ userId: ref.afterUser._id, text: 'some daily', streak: -1 });
      scoreTask({ user: ref.afterUser, task, direction: 'up' });
      expect(ref.afterUser.achievements.streak).to.equal(0);
    });

    it('does not remove a streak achievement when unticking a Daily gives a streak of zero', () => {
      const task1 = generateDaily({ userId: ref.afterUser._id, text: 'first daily', streak: initialStreakCount });
      scoreTask({ user: ref.afterUser, task: task1, direction: 'up' });
      const task2 = generateDaily({ userId: ref.afterUser._id, text: 'second daily', streak: 1 });
      scoreTask({ user: ref.afterUser, task: task2, direction: 'down' });
      expect(ref.afterUser.achievements.streak).to.equal(1);
    });
  });

  describe('scores', () => {
    let options = {};
    let habit;
    let freshDaily; let
      daily;
    let freshTodo; let
      todo;

    beforeEach(() => {
      ref = beforeAfter(options);
      habit = generateHabit({ userId: ref.afterUser._id, text: 'some habit' });
      freshDaily = generateDaily({ userId: ref.afterUser._id, text: 'some daily' });
      daily = generateDaily({ userId: ref.afterUser._id, text: 'some daily' });
      freshTodo = generateTodo({ userId: ref.afterUser._id, text: 'some todo' });
      todo = generateTodo({ userId: ref.afterUser._id, text: 'some todo' });

      expect(habit.history.length).to.eql(0);
      expect(habit.frequency).to.equal('daily');
      expect(habit.counterUp).to.equal(0);
      expect(habit.counterDown).to.equal(0);

      // before and after are the same user
      expect(ref.beforeUser._id).to.exist;
      expect(ref.beforeUser._id).to.eql(ref.afterUser._id);
    });

    it('critical hits', () => {
      const normalUser = ref.beforeUser;
      expect(normalUser.party.quest.progress.up).to.eql(0);
      normalUser.party.quest.key = 'gryphon';
      const critUser = ref.afterUser;
      expect(critUser.party.quest.progress.up).to.eql(0);
      critUser.party.quest.key = 'gryphon';
      const normalTask = todo;
      const critTask = freshTodo;

      scoreTask({
        user: normalUser, task: normalTask, direction: 'up', cron: false,
      });
      const normalTaskDelta = normalUser.party.quest.progress.up;

      sandbox.stub(crit, 'crit').returns(1.5);
      scoreTask({
        user: critUser, task: critTask, direction: 'up', cron: false,
      });
      const critTaskDelta = critUser.party.quest.progress.up;
      crit.crit.restore();

      expect(critUser.stats.hp).to.eql(normalUser.stats.hp);
      expect(critUser.stats.gp).to.be.greaterThan(normalUser.stats.gp);
      expect(critUser.stats.mp).to.be.greaterThan(normalUser.stats.mp);
      expect(critUser.stats.exp).to.be.greaterThan(normalUser.stats.exp);
      expect(critTask.value).to.eql(normalTask.value);
      expect(critTaskDelta).to.be.greaterThan(normalTaskDelta);
    });

    it('and increments quest progress', () => {
      expect(ref.afterUser.party.quest.progress.up).to.eql(0);
      ref.afterUser.party.quest.key = 'gryphon';

      scoreTask({
        user: ref.afterUser, task: habit, direction: 'up', cron: false,
      });
      const firstTaskDelta = ref.afterUser.party.quest.progress.up;
      expect(firstTaskDelta).to.be.greaterThan(0);
      expect(ref.afterUser._tmp.quest.progressDelta).to.eql(firstTaskDelta);

      scoreTask({
        user: ref.afterUser, task: habit, direction: 'up', cron: false,
      });
      const secondTaskDelta = ref.afterUser.party.quest.progress.up - firstTaskDelta;
      expect(secondTaskDelta).to.be.greaterThan(0);
      expect(ref.afterUser._tmp.quest.progressDelta).to.eql(secondTaskDelta);
    });

    context('habits', () => {
      it('up', () => {
        options = {
          user: ref.afterUser, task: habit, direction: 'up', times: 5, cron: false,
        };
        scoreTask(options);

        expect(habit.history.length).to.eql(1);
        expect(habit.value).to.be.greaterThan(0);
        expect(habit.counterUp).to.equal(5);

        expect(ref.afterUser.stats.hp).to.eql(50);
        expect(ref.afterUser.stats.exp).to.be.greaterThan(ref.beforeUser.stats.exp);
        expect(ref.afterUser.stats.gp).to.be.greaterThan(ref.beforeUser.stats.gp);
      });

      // not supported anymore
      it('does not add score notes to task', () => {
        const scoreNotesString = 'scoreNotes';
        habit.scoreNotes = scoreNotesString;
        options = {
          user: ref.afterUser, task: habit, direction: 'up', times: 5, cron: false,
        };
        scoreTask(options);

        expect(habit.history[0].scoreNotes).to.eql(undefined);
      });

      it('down', () => {
        scoreTask({
          user: ref.afterUser, task: habit, direction: 'down', times: 5, cron: false,
        }, {});

        expect(habit.history.length).to.eql(1);
        expect(habit.value).to.be.lessThan(0);
        expect(habit.counterDown).to.equal(5);

        expect(ref.afterUser.stats.hp).to.be.lessThan(ref.beforeUser.stats.hp);
        expect(ref.afterUser.stats.exp).to.eql(0);
        expect(ref.afterUser.stats.gp).to.eql(0);
      });
    });

    context('dailys', () => {
      it('up', () => {
        expect(daily.completed).to.not.eql(true);
        scoreTask({ user: ref.afterUser, task: daily, direction: 'up' });
        expectGainedPoints(ref.beforeUser, ref.afterUser, freshDaily, daily);
        expect(daily.completed).to.eql(true);
        expect(daily.history.length).to.eql(1);
      });

      it('up, down', () => {
        scoreTask({ user: ref.afterUser, task: daily, direction: 'up' });
        expect(daily.history.length).to.eql(1);
        scoreTask({ user: ref.afterUser, task: daily, direction: 'down' });
        expect(daily.history.length).to.eql(0);
        expectClosePoints(ref.beforeUser, ref.afterUser, freshDaily, daily);
      });

      it('sets completed = false on direction = down', () => {
        daily.completed = true;
        expect(daily.completed).to.not.eql(false);
        scoreTask({ user: ref.afterUser, task: daily, direction: 'down' });
        expect(daily.completed).to.eql(false);
      });
    });

    context('todos', () => {
      it('up', () => {
        scoreTask({ user: ref.afterUser, task: todo, direction: 'up' });
        expectGainedPoints(ref.beforeUser, ref.afterUser, freshTodo, todo);
      });

      it('up, down', () => {
        scoreTask({ user: ref.afterUser, task: todo, direction: 'up' });
        scoreTask({ user: ref.afterUser, task: todo, direction: 'down' });
        expectClosePoints(ref.beforeUser, ref.afterUser, freshTodo, todo);
      });
    });

    context('onboarding', () => {
      beforeEach(() => {
        ref.afterUser.addAchievement = sinon.spy();
        sinon.stub(shared.onboarding, 'checkOnboardingStatus');
      });

      afterEach(() => {
        shared.onboarding.checkOnboardingStatus.restore();
      });

      it('adds the achievement to the user and checks the onboarding status', () => {
        scoreTask({ user: ref.afterUser, task: todo, direction: 'up' });
        expect(ref.afterUser.addAchievement).to.be.calledOnce;
        expect(ref.afterUser.addAchievement).to.be.calledWith('completedTask');

        expect(shared.onboarding.checkOnboardingStatus).to.be.calledOnce;
        expect(shared.onboarding.checkOnboardingStatus).to.be.calledWith(ref.afterUser);
      });

      it('does not add the onboarding achievement to the user if it\'s already been awarded', () => {
        ref.afterUser.achievements.completedTask = true;
        scoreTask({ user: ref.afterUser, task: todo, direction: 'up' });

        expect(ref.afterUser.addAchievement).to.not.be.called;
      });

      it('does not add the onboarding achievement to the user if it\'s scored down', () => {
        scoreTask({ user: ref.afterUser, task: todo, direction: 'down' });

        expect(ref.afterUser.addAchievement).to.not.be.called;
      });

      it('does not add the onboarding achievement to the user if cron is running', () => {
        scoreTask({
          user: ref.afterUser,
          task: todo,
          direction: 'up',
          cron: true,
        });

        expect(ref.afterUser.addAchievement).to.not.be.called;
      });
    });
  });
});
