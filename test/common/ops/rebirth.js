import rebirth from '../../../website/common/script/ops/rebirth';
import i18n from '../../../website/common/script/i18n';
import { MAX_LEVEL } from '../../../website/common/script/constants';
import {
  generateUser,
  generateHabit,
  generateDaily,
  generateTodo,
  generateReward,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';

describe('shared.ops.rebirth', () => {
  let user;
  let animal = 'Wolf-Base';
  let userStats = ['per', 'int', 'con', 'str', 'points', 'gp', 'exp', 'mp'];
  let tasks = [];

  beforeEach(() => {
    user = generateUser();
    user.balance = 1.5;
    tasks = [generateHabit(), generateDaily(), generateTodo(), generateReward()];
  });

  it('returns an error when user balance is too low and user is less than max level', (done) => {
    user.balance = 0;

    try {
      rebirth(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
      done();
    }
  });

  it('rebirths a user with enough gems', () => {
    let [, message] = rebirth(user);

    expect(message).to.equal(i18n.t('rebirthComplete'));
  });

  it('rebirths a user with not enough gems but max level', () => {
    user.balance = 0;
    user.stats.lvl = MAX_LEVEL;

    let [, message] = rebirth(user);

    expect(message).to.equal(i18n.t('rebirthComplete'));
  });

  it('rebirths a user with not enough gems but more than max level', () => {
    user.balance = 0;
    user.stats.lvl = MAX_LEVEL + 1;

    let [, message] = rebirth(user);

    expect(message).to.equal(i18n.t('rebirthComplete'));
  });

  it('resets user\'s tasks values except for rewards to 0', () => {
    tasks[0].value = 1;
    tasks[1].value = 1;
    tasks[2].value = 1;
    tasks[3].value = 1; // Reward

    rebirth(user, tasks);

    expect(tasks[0].value).to.equal(0);
    expect(tasks[1].value).to.equal(0);
    expect(tasks[2].value).to.equal(0);
    expect(tasks[3].value).to.equal(1); // Reward
  });

  it('resets user\'s daily streaks to 0', () => {
    tasks[1].streak = 1; // Daily

    rebirth(user, tasks);

    expect(tasks[1].streak).to.equal(0);
  });

  it('resets a user\'s buffs', () => {
    user.stats.buffs = {test: 'test'};

    rebirth(user);

    expect(user.stats.buffs).to.be.empty;
  });

  it('resets a user\'s health points', () => {
    user.stats.hp = 40;

    rebirth(user);

    expect(user.stats.hp).to.equal(50);
  });

  it('resets a user\'s class', () => {
    user.stats.class = 'rouge';

    rebirth(user);

    expect(user.stats.class).to.equal('warrior');
  });

  it('resets a user\'s stats', () => {
    user.stats.class = 'rouge';
    _.each(userStats, function setUsersStats (value) {
      user.stats[value] = 10;
    });

    rebirth(user);

    _.each(userStats, function resetUserStats (value) {
      user.stats[value] = 0;
    });
  });

  it('retains a user\'s gear', () => {
    let prevGearEquipped = user.items.gear.equipped;
    let prevGearCostume = user.items.gear.costume;
    let prevPrefCostume = user.preferences.costume;

    rebirth(user);

    expect(user.items.gear.equipped).to.deep.equal(prevGearEquipped);
    expect(user.items.gear.costume).to.deep.equal(prevGearCostume);
    expect(user.preferences.costume).to.equal(prevPrefCostume);
  });

  it('retains a user\'s gear owned', () => {
    user.items.gear.owned.weapon_warrior_1 = true; // eslint-disable-line camelcase
    let prevGearOwned = user.items.gear.owned;

    rebirth(user);

    expect(user.items.gear.owned).to.equal(prevGearOwned);
  });

  it('resets a user\'s current pet', () => {
    user.items.pets[animal] = true;
    user.items.currentPet = animal;
    rebirth(user);

    expect(user.items.currentPet).to.be.empty;
  });

  it('resets a user\'s current mount', () => {
    user.items.mounts[animal] = true;
    user.items.currentMount = animal;
    rebirth(user);

    expect(user.items.currentMount).to.be.empty;
  });

  it('resets a user\'s flags', () => {
    user.flags.itemsEnabled = true;
    user.flags.dropsEnabled = true;
    user.flags.classSelected = true;
    user.flags.rebirthEnabled = true;
    user.flags.levelDrops = {test: 'test'};

    rebirth(user);

    expect(user.flags.itemsEnabled).to.be.false;
    expect(user.flags.dropsEnabled).to.be.false;
    expect(user.flags.classSelected).to.be.false;
    expect(user.flags.rebirthEnabled).to.be.false;
    expect(user.flags.levelDrops).to.be.empty;
  });

  it('does not reset rebirthEnabled if user has beastMaster', () => {
    user.achievements.beastMaster = 1;
    user.flags.rebirthEnabled = true;

    rebirth(user);

    expect(user.flags.rebirthEnabled).to.be.true;
  });

  it('sets rebirth achievement', () => {
    rebirth(user);

    expect(user.achievements.rebirths).to.equal(1);
    expect(user.achievements.rebirthLevel).to.equal(user.stats.lvl);
  });

  it('increments rebirth achievements', () => {
    user.stats.lvl = 2;
    user.achievements.rebirths = 1;
    user.achievements.rebirthLevel = 1;

    rebirth(user);

    expect(user.achievements.rebirths).to.equal(2);
    expect(user.achievements.rebirthLevel).to.equal(2);
  });

  it('does not increment rebirth achievements when level is lower than previous', () => {
    user.stats.lvl = 2;
    user.achievements.rebirths = 1;
    user.achievements.rebirthLevel = 3;

    rebirth(user);

    expect(user.achievements.rebirths).to.equal(1);
    expect(user.achievements.rebirthLevel).to.equal(3);
  });

  it('always increments rebirth achievements when level is MAX_LEVEL', () => {
    user.stats.lvl = MAX_LEVEL;
    user.achievements.rebirths = 1;
    user.achievements.rebirthLevel = MAX_LEVEL + 1; // this value is not actually possible (actually capped at MAX_LEVEL) but makes a good test

    rebirth(user);

    expect(user.achievements.rebirths).to.equal(2);
    expect(user.achievements.rebirthLevel).to.equal(MAX_LEVEL);
  });

  it('always increments rebirth achievements when level is greater than MAX_LEVEL', () => {
    user.stats.lvl = MAX_LEVEL + 1;
    user.achievements.rebirths = 1;
    user.achievements.rebirthLevel = MAX_LEVEL + 2; // this value is not actually possible (actually capped at MAX_LEVEL) but makes a good test

    rebirth(user);

    expect(user.achievements.rebirths).to.equal(2);
    expect(user.achievements.rebirthLevel).to.equal(MAX_LEVEL);
  });

  it('keeps automaticAllocation false', () => {
    user.preferences.automaticAllocation = false;

    rebirth(user);

    expect(user.preferences.automaticAllocation).to.be.false;
  });

  it('sets automaticAllocation to false when true', () => {
    user.preferences.automaticAllocation = true;

    rebirth(user);

    expect(user.preferences.automaticAllocation).to.be.false;
  });
});
