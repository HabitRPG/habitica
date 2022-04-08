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
  const animal = 'Wolf-Base';
  const userStats = ['per', 'int', 'con', 'str', 'points', 'gp', 'exp', 'mp'];
  let tasks = [];

  beforeEach(() => {
    user = generateUser();
    user.balance = 1.5;
    tasks = [generateHabit(), generateDaily(), generateTodo(), generateReward()];
  });

  it('returns an error when user balance is too low and user is less than max level', async () => {
    user.balance = 0;

    try {
      await rebirth(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
    }
  });

  it('rebirths a user with enough gems', async () => {
    const [, message] = await rebirth(user);

    expect(message).to.equal(i18n.t('rebirthComplete'));
  });

  it('rebirths a user with not enough gems but max level', async () => {
    user.balance = 0;
    user.stats.lvl = MAX_LEVEL;

    const [, message] = await rebirth(user);

    expect(message).to.equal(i18n.t('rebirthComplete'));
    expect(user.flags.lastFreeRebirth).to.exist;
  });

  it('rebirths a user with not enough gems but more than max level', async () => {
    user.balance = 0;
    user.stats.lvl = MAX_LEVEL + 1;

    const [, message] = await rebirth(user);

    expect(message).to.equal(i18n.t('rebirthComplete'));
  });

  it('rebirths a user using gems if over max level but rebirthed recently', async () => {
    user.stats.lvl = MAX_LEVEL + 1;
    user.flags.lastFreeRebirth = new Date();

    const [, message] = await rebirth(user);

    expect(message).to.equal(i18n.t('rebirthComplete'));
    expect(user.balance).to.equal(0);
  });

  it('resets user\'s tasks values except for rewards to 0', async () => {
    tasks[0].value = 1;
    tasks[1].value = 1;
    tasks[2].value = 1;
    tasks[3].value = 1; // Reward

    await rebirth(user, tasks);

    expect(tasks[0].value).to.equal(0);
    expect(tasks[1].value).to.equal(0);
    expect(tasks[2].value).to.equal(0);
    expect(tasks[3].value).to.equal(1); // Reward
  });

  it('resets user\'s daily streaks to 0', async () => {
    tasks[0].counterDown = 1; // Habit
    tasks[0].counterUp = 1; // Habit
    tasks[1].streak = 1; // Daily

    await rebirth(user, tasks);

    expect(tasks[0].counterDown).to.equal(0);
    expect(tasks[0].counterUp).to.equal(0);
    expect(tasks[1].streak).to.equal(0);
  });

  it('resets a user\'s buffs', async () => {
    user.stats.buffs = { test: 'test' };

    await rebirth(user);

    expect(user.stats.buffs).to.be.empty;
  });

  it('resets a user\'s health points', async () => {
    user.stats.hp = 40;

    await rebirth(user);

    expect(user.stats.hp).to.equal(50);
  });

  it('resets a user\'s class', async () => {
    user.stats.class = 'rouge';

    await rebirth(user);

    expect(user.stats.class).to.equal('warrior');
  });

  it('resets a user\'s stats', async () => {
    user.stats.class = 'rouge';
    _.each(userStats, value => {
      user.stats[value] = 10;
    });

    await rebirth(user);

    _.each(userStats, value => {
      user.stats[value] = 0;
    });
  });

  it('retains a user\'s gear', async () => {
    const prevGearEquipped = user.items.gear.equipped;
    const prevGearCostume = user.items.gear.costume;
    const prevPrefCostume = user.preferences.costume;

    await rebirth(user);

    expect(user.items.gear.equipped).to.deep.equal(prevGearEquipped);
    expect(user.items.gear.costume).to.deep.equal(prevGearCostume);
    expect(user.preferences.costume).to.equal(prevPrefCostume);
  });

  it('retains a user\'s gear owned', async () => {
    user.items.gear.owned.weapon_warrior_1 = true; // eslint-disable-line camelcase
    const prevGearOwned = user.items.gear.owned;

    await rebirth(user);

    expect(user.items.gear.owned).to.equal(prevGearOwned);
  });

  it('resets a user\'s current pet', async () => {
    user.items.pets[animal] = true;
    user.items.currentPet = animal;
    await rebirth(user);

    expect(user.items.currentPet).to.be.empty;
  });

  it('resets a user\'s current mount', async () => {
    user.items.mounts[animal] = true;
    user.items.currentMount = animal;
    await rebirth(user);

    expect(user.items.currentMount).to.be.empty;
  });

  it('resets a user\'s flags', async () => {
    user.flags.itemsEnabled = true;
    user.flags.classSelected = true;
    user.flags.rebirthEnabled = true;
    user.flags.levelDrops = { test: 'test' };

    await rebirth(user);

    expect(user.flags.itemsEnabled).to.be.false;
    expect(user.flags.classSelected).to.be.false;
    expect(user.flags.rebirthEnabled).to.be.false;
    expect(user.flags.levelDrops).to.be.empty;
  });

  it('reset rebirthEnabled even if user has beastMaster', async () => {
    user.achievements.beastMaster = 1;
    user.flags.rebirthEnabled = true;

    await rebirth(user);

    expect(user.flags.rebirthEnabled).to.be.false;
  });

  it('sets rebirth achievement', async () => {
    await rebirth(user);

    expect(user.achievements.rebirths).to.equal(1);
    expect(user.achievements.rebirthLevel).to.equal(user.stats.lvl);
  });

  it('increments rebirth achievements', async () => {
    user.stats.lvl = 2;
    user.achievements.rebirths = 1;
    user.achievements.rebirthLevel = 1;

    await rebirth(user);

    expect(user.achievements.rebirths).to.equal(2);
    expect(user.achievements.rebirthLevel).to.equal(2);
  });

  it('does not increment rebirth achievements when level is lower than previous', async () => {
    user.stats.lvl = 2;
    user.achievements.rebirths = 1;
    user.achievements.rebirthLevel = 3;

    await rebirth(user);

    expect(user.achievements.rebirths).to.equal(1);
    expect(user.achievements.rebirthLevel).to.equal(3);
  });

  it('always increments rebirth achievements when level is MAX_LEVEL', async () => {
    user.stats.lvl = MAX_LEVEL;
    user.achievements.rebirths = 1;
    // this value is not actually possible (actually capped at MAX_LEVEL) but makes a good test
    user.achievements.rebirthLevel = MAX_LEVEL + 1;

    await rebirth(user);

    expect(user.achievements.rebirths).to.equal(2);
    expect(user.achievements.rebirthLevel).to.equal(MAX_LEVEL);
  });

  it('always increments rebirth achievements when level is greater than MAX_LEVEL', async () => {
    user.stats.lvl = MAX_LEVEL + 1;
    user.achievements.rebirths = 1;
    // this value is not actually possible (actually capped at MAX_LEVEL) but makes a good test
    user.achievements.rebirthLevel = MAX_LEVEL + 2;

    await rebirth(user);

    expect(user.achievements.rebirths).to.equal(2);
    expect(user.achievements.rebirthLevel).to.equal(MAX_LEVEL);
  });

  it('keeps automaticAllocation false', async () => {
    user.preferences.automaticAllocation = false;

    await rebirth(user);

    expect(user.preferences.automaticAllocation).to.be.false;
  });

  it('sets automaticAllocation to false when true', async () => {
    user.preferences.automaticAllocation = true;

    await rebirth(user);

    expect(user.preferences.automaticAllocation).to.be.false;
  });
});
