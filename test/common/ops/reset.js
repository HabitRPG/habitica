import reset from '../../../website/common/script/ops/reset';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
  generateDaily,
  generateHabit,
  generateReward,
  generateTodo,
} from '../../helpers/common.helper';

describe('shared.ops.reset', () => {
  let user;
  let tasksToRemove;

  beforeEach(() => {
    user = generateUser();
    user.balance = 2;

    const habit = generateHabit();
    const todo = generateTodo();
    const daily = generateDaily();
    const reward = generateReward();

    user.tasksOrder.habits = [habit._id];
    user.tasksOrder.todos = [todo._id];
    user.tasksOrder.dailys = [daily._id];
    user.tasksOrder.rewards = [reward._id];

    tasksToRemove = [habit, todo, daily, reward];
  });

  it('resets a user', () => {
    const [, message] = reset(user);

    expect(message).to.equal(i18n.t('resetComplete'));
  });

  it('resets user\'s health', () => {
    user.stats.hp = 40;

    reset(user);

    expect(user.stats.hp).to.equal(50);
  });

  it('resets user\'s level', () => {
    user.stats.lvl = 2;

    reset(user);

    expect(user.stats.lvl).to.equal(1);
  });

  it('resets user\'s stat points (str, con, int, per, points)', () => {
    user.stats.str = 2;
    user.stats.con = 2;
    user.stats.int = 2;
    user.stats.per = 2;
    user.stats.points = 2;

    reset(user);

    expect(user.stats.str).to.equal(0);
    expect(user.stats.con).to.equal(0);
    expect(user.stats.int).to.equal(0);
    expect(user.stats.per).to.equal(0);
    expect(user.stats.points).to.equal(1);
  });

  it('resets user\'s gold', () => {
    user.stats.gp = 20;

    reset(user);

    expect(user.stats.gp).to.equal(0);
  });

  it('resets user\'s exp', () => {
    user.stats.exp = 20;

    reset(user);

    expect(user.stats.exp).to.equal(0);
  });

  it('resets user\'s tasksOrder', () => {
    reset(user, tasksToRemove);

    expect(user.tasksOrder.habits).to.be.empty;
    expect(user.tasksOrder.todos).to.be.empty;
    expect(user.tasksOrder.dailys).to.be.empty;
    expect(user.tasksOrder.rewards).to.be.empty;
  });

  it('keeps automaticAllocation false', () => {
    user.preferences.automaticAllocation = false;

    reset(user);

    expect(user.preferences.automaticAllocation).to.be.false;
  });

  it('sets automaticAllocation to false when true', () => {
    user.preferences.automaticAllocation = true;

    reset(user);

    expect(user.preferences.automaticAllocation).to.be.false;
  });
});
