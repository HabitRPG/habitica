import revive from '../../../common/script/ops/revive';
import i18n from '../../../common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../common/script/libs/errors';
import content from '../../../common/script/content/index';

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

  it('removes a random item from user gear owned', () => {
    let weaponKey = 'weapon_warrior_0';
    user.items.gear.owned[weaponKey] = true;

    let [, message] = revive(user);

    expect(message).to.equal(i18n.t('messageLostItem', { itemText: content.gear.flat[weaponKey].text()}));
    expect(user.items.gear.owned[weaponKey]).to.be.false;
  });

  it('removes a random item from user gear equipped', () => {
    let weaponKey = 'weapon_warrior_0';
    let itemToLose = content.gear.flat[weaponKey];

    user.items.gear.owned[weaponKey] = true;
    user.items.gear.equipped[itemToLose.type] = itemToLose.key;

    let [, message] = revive(user);

    expect(message).to.equal(i18n.t('messageLostItem', { itemText: itemToLose.text()}));
    expect(user.items.gear.equipped[itemToLose.type]).to.equal(`${itemToLose.type}_base_0`);
  });

  it('removes a random item from user gear costume', () => {
    let weaponKey = 'weapon_warrior_0';
    let itemToLose = content.gear.flat[weaponKey];

    user.items.gear.owned[weaponKey] = true;
    user.items.gear.costume[itemToLose.type] = itemToLose.key;

    let [, message] = revive(user);

    expect(message).to.equal(i18n.t('messageLostItem', { itemText: itemToLose.text()}));
    expect(user.items.gear.costume[itemToLose.type]).to.equal(`${itemToLose.type}_base_0`);
  });
});
