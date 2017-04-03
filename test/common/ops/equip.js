/* eslint-disable camelcase */
import equip from '../../../website/common/script/ops/equip';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import content from '../../../website/common/script/content/index';

describe('shared.ops.equip', () => {
  let user;

  beforeEach(() => {
    user = generateUser({
      items: {
        gear: {
          owned: {
            weapon_warrior_0: true,
            weapon_warrior_1: true,
            weapon_warrior_2: true,
            weapon_wizard_1: true,
            weapon_wizard_2: true,
            shield_base_0: true,
            shield_warrior_1: true,
          },
          equipped: {
            weapon: 'weapon_warrior_0',
            shield: 'shield_base_0',
          },
        },
      },
      stats: {gp: 200},
    });
  });

  context('Gear', () => {
    it('should not send a message if a weapon is equipped while only having zero or one weapons equipped', () => {
      equip(user, {params: {key: 'weapon_warrior_1'}});

      // one-handed to one-handed
      let [, message] = equip(user, {params: {key: 'weapon_warrior_2'}});
      expect(message).to.not.exist;

      // one-handed to two-handed
      [, message] = equip(user, {params: {key: 'weapon_wizard_1'}});
      expect(message).to.not.exist;

      // two-handed to two-handed
      [, message] = equip(user, {params: {key: 'weapon_wizard_2'}});
      expect(message).to.not.exist;

      // two-handed to one-handed
      [, message] = equip(user, {params: {key: 'weapon_warrior_2'}});
      expect(message).to.not.exist;
    });

    it('should send messages if equipping a two-hander causes the off-hander to be unequipped', () => {
      equip(user, {params: {key: 'weapon_warrior_1'}});
      equip(user, {params: {key: 'shield_warrior_1'}});

      // equipping two-hander
      let [data, message] = equip(user, {params: {key: 'weapon_wizard_1'}});
      let weapon = content.gear.flat.weapon_wizard_1;
      let item = content.gear.flat.shield_warrior_1;

      let res = {data, message};
      expect(res).to.eql({
        message: i18n.t('messageTwoHandedEquip', {twoHandedText: weapon.text(), offHandedText: item.text()}),
        data: user.items,
      });
    });

    it('should send messages if equipping an off-hand item causes a two-handed weapon to be unequipped', () => {
      // equipping two-hander
      equip(user, {params: {key: 'weapon_wizard_1'}});
      let weapon = content.gear.flat.weapon_wizard_1;
      let shield = content.gear.flat.shield_warrior_1;

      let [data, message] = equip(user, {params: {key: 'shield_warrior_1'}});

      let res = {data, message};
      expect(res).to.eql({
        message: i18n.t('messageTwoHandedUnequip', {twoHandedText: weapon.text(), offHandedText: shield.text()}),
        data: user.items,
      });
    });
  });
});
