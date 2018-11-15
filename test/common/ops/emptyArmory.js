/* eslint-disable camelcase */

import emptyArmory from '../../../website/common/script/ops/emptyArmory';
import i18n from '../../../website/common/script/i18n';
import { MAX_LEVEL } from '../../../website/common/script/constants';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';

describe('shared.ops.emptyArmory', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.balance = 0.5;
  });

  it('returns an error when user balance is too low and user is less than max level', (done) => {
    user.balance = 0;

    try {
      emptyArmory(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
      done();
    }
  });

  it('empty the armory of a user with enough gems', () => {
    let [, message] = emptyArmory(user);

    expect(message).to.equal(i18n.t('emptyArmoryComplete'));
  });

  it('empty the armory of a user with not enough gems but max level', () => {
    user.balance = 0;
    user.stats.lvl = MAX_LEVEL;

    let [, message] = emptyArmory(user);

    expect(message).to.equal(i18n.t('emptyArmoryComplete'));
  });

  it('resets a user\'s gear', () => {
    let gearReset = {
      armor: 'armor_base_0',
      weapon: 'weapon_warrior_0',
      head: 'head_base_0',
      shield: 'shield_base_0',
    };

    emptyArmory(user);

    expect(user.items.gear.equipped).to.deep.equal(gearReset);
    expect(user.items.gear.costume).to.deep.equal(gearReset);
    expect(user.preferences.costume).to.be.false;
  });

  it('resets a user\'s gear owned', () => {
    user.items.gear.owned.weapon_warrior_1 = true;
    emptyArmory(user);

    expect(user.items.gear.owned.weapon_warrior_1).to.be.false;
    expect(user.items.gear.owned.weapon_warrior_0).to.be.true;
  });

  it('does not remove 0 value items', () => {
    let headKey = 'head_special_turkeyHelmBase';
    user.items.gear.owned[headKey] = true;

    emptyArmory(user);

    expect(user.items.gear.owned[headKey]).to.be.true;
  });

  it('removes items of a different class', () => {
    let weaponKey = 'weapon_wizard_1';
    user.items.gear.owned[weaponKey] = true;

    emptyArmory(user);

    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('removes "special contributors" items', () => {
    let weaponKey = 'weapon_special_1';
    user.items.gear.owned[weaponKey] = true;

    emptyArmory(user);

    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('removes "special backers" items', () => {
    let weaponKey = 'weapon_special_2';
    user.items.gear.owned[weaponKey] = true;

    emptyArmory(user);

    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('removes "armoire" items', () => {
    let weaponKey = 'armor_armoire_goldenToga';
    user.items.gear.owned[weaponKey] = true;

    emptyArmory(user);

    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('removes "season" items', () => {
    let weaponKey = 'weapon_special_yeti';
    user.items.gear.owned[weaponKey] = true;

    emptyArmory(user);

    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('resets only emptyArmoryEnabled user\'s flag', () => {
    let currentLevelDrops = {test: 'test'};

    user.flags.itemsEnabled = true;
    user.flags.dropsEnabled = true;
    user.flags.classSelected = true;
    user.flags.rebirthEnabled = true;
    user.flags.emptyArmoryEnabled = true;
    user.flags.levelDrops = currentLevelDrops;

    emptyArmory(user);

    expect(user.flags.itemsEnabled).to.be.true;
    expect(user.flags.dropsEnabled).to.be.true;
    expect(user.flags.classSelected).to.be.true;
    expect(user.flags.rebirthEnabled).to.be.true;
    expect(user.flags.emptyArmoryEnabled).to.be.false;
    expect(user.flags.levelDrops).to.equal(currentLevelDrops);
  });

  it('sets empty the armory achievement', () => {
    emptyArmory(user);

    expect(user.achievements.emptyArmorys).to.equal(1);
    expect(user.achievements.emptyArmoryLevel).to.equal(user.stats.lvl);
  });

  it('increments empty the armory achievements', () => {
    user.stats.lvl = 2;
    user.achievements.emptyArmorys = 1;
    user.achievements.emptyArmoryLevel = 1;

    emptyArmory(user);

    expect(user.achievements.emptyArmorys).to.equal(2);
    expect(user.achievements.emptyArmoryLevel).to.equal(2);
  });

  it('does not increment empty the armory achievements when level is lower than previous', () => {
    user.stats.lvl = 2;
    user.achievements.emptyArmorys = 1;
    user.achievements.emptyArmoryLevel = 3;

    emptyArmory(user);

    expect(user.achievements.emptyArmorys).to.equal(1);
    expect(user.achievements.emptyArmoryLevel).to.equal(3);
  });

  it('always increments empty the armory achievements when level is MAX_LEVEL', () => {
    user.stats.lvl = MAX_LEVEL;
    user.achievements.emptyArmorys = 1;
    user.achievements.emptyArmoryLevel = MAX_LEVEL + 1;

    emptyArmory(user);

    expect(user.achievements.emptyArmorys).to.equal(2);
    expect(user.achievements.emptyArmoryLevel).to.equal(MAX_LEVEL);
  });
});