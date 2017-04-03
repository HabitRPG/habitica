/* eslint-disable camelcase */

import revive from '../../../website/common/script/ops/revive';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';
import content from '../../../website/common/script/content/index';

describe('shared.ops.revive', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.stats.hp = 0;
  });

  it('returns an error when user is not dead', (done) => {
    user.stats.hp = 10;

    try {
      revive(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('cannotRevive'));
      done();
    }
  });

  it('resets user\'s hp, exp and gp', () => {
    user.stats.exp = 100;
    user.stats.gp = 100;

    revive(user);

    expect(user.stats.hp).to.equal(50);
    expect(user.stats.exp).to.equal(0);
    expect(user.stats.gp).to.equal(0);
  });

  it('decreases user\'s level', () => {
    user.stats.lvl = 2;
    revive(user);

    expect(user.stats.lvl).to.equal(1);
  });

  it('decreases a stat', () => {
    user.stats.str = 2;
    revive(user);

    expect(user.stats.str).to.equal(1);
  });

  it('it decreases a random stat from str, con, per, int by one', () => {
    let stats = ['str', 'con', 'per', 'int'];

    _.each(stats, (s) => {
      user.stats[s] = 1;
    });

    revive(user);

    let statSum = _.reduce(stats, (m, k) => {
      return m + user.stats[k];
    }, 0);

    expect(statSum).to.equal(3);
  });

  it('removes a random item from user gear owned', () => {
    let weaponKey = 'weapon_warrior_0';
    user.items.gear.owned[weaponKey] = true;

    let [, message] = revive(user);

    expect(message).to.equal(i18n.t('messageLostItem', { itemText: content.gear.flat[weaponKey].text()}));
    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('does not remove 0 value items', () => {
    user.items.gear.owned = {
      eyewear_special_yellowTopFrame: true,
    };

    revive(user);

    expect(user.items.gear.owned.eyewear_special_yellowTopFrame).to.be.true;
  });

  it('allows removing warrior sword (0 value item)', () => {
    user.items.gear.owned = {
      weapon_warrior_0: true,
    };

    let weaponKey = 'weapon_warrior_0';

    let [, message] = revive(user);

    expect(message).to.equal(i18n.t('messageLostItem', { itemText: content.gear.flat[weaponKey].text()}));
    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('does not remove items of a different class', () => {
    let weaponKey = 'weapon_wizard_1';
    user.items.gear.owned[weaponKey] = true;

    let [, message] = revive(user);

    expect(message).to.equal('');
    expect(user.items.gear.owned[weaponKey]).to.be.true;
  });

  it('removes "special" items', () => {
    let weaponKey = 'weapon_special_1';
    user.items.gear.owned[weaponKey] = true;

    let [, message] = revive(user);

    expect(message).to.equal(i18n.t('messageLostItem', { itemText: content.gear.flat[weaponKey].text()}));
    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('removes "armoire" items', () => {
    let weaponKey = 'armor_armoire_goldenToga';
    user.items.gear.owned[weaponKey] = true;

    let [, message] = revive(user);

    expect(message).to.equal(i18n.t('messageLostItem', { itemText: content.gear.flat[weaponKey].text()}));
    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('dequips lost item from user if user had it equipped', () => {
    let weaponKey = 'weapon_warrior_0';
    let itemToLose = content.gear.flat[weaponKey];

    user.items.gear.owned[weaponKey] = true;
    user.items.gear.equipped[itemToLose.type] = itemToLose.key;

    let [, message] = revive(user);

    expect(message).to.equal(i18n.t('messageLostItem', { itemText: itemToLose.text()}));
    expect(user.items.gear.equipped[itemToLose.type]).to.equal(`${itemToLose.type}_base_0`);
  });

  it('dequips lost item from user costume if user was using it in costume', () => {
    let weaponKey = 'weapon_warrior_0';
    let itemToLose = content.gear.flat[weaponKey];

    user.items.gear.owned[weaponKey] = true;
    user.items.gear.costume[itemToLose.type] = itemToLose.key;

    let [, message] = revive(user);

    expect(message).to.equal(i18n.t('messageLostItem', { itemText: itemToLose.text()}));
    expect(user.items.gear.costume[itemToLose.type]).to.equal(`${itemToLose.type}_base_0`);
  });
});
