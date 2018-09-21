import emptyArmory from '../../../website/common/script/ops/emptyArmory';
import i18n from '../../../website/common/script/i18n';
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
    user.items.gear.owned.weapon_warrior_1 = true; // eslint-disable-line camelcase
    emptyArmory(user);

    expect(user.items.gear.owned.weapon_warrior_1).to.be.false;
    expect(user.items.gear.owned.weapon_warrior_0).to.be.true;
  });
});