/* eslint-disable camelcase */

import sinon from 'sinon'; // eslint-disable-line no-shadow
import {assert} from 'sinon';
import i18n from '../../common/script/i18n';
import shared from '../../common/script/index.js';
import content from '../../common/script/content/index';

describe('user.ops.equip', () => {
  let user;
  let spy;

  beforeEach(() => {
    user = {
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
      preferences: {},
      stats: {gp: 200},
      achievements: {},
      flags: {},
    };

    shared.wrap(user);
    spy = sinon.spy();
  });

  context('Gear', () => {
    it('should not send a message if a weapon is equipped while only having zero or one weapons equipped', () => {
      // user.ops.equip always calls the callback, even if it isn't sending a message
      // so we need to check to see if a single null message was sent.
      user.ops.equip({params: {key: 'weapon_warrior_1'}});

      // one-handed to one-handed
      user.ops.equip({params: {key: 'weapon_warrior_2'}}, spy);

      assert.calledOnce(spy);
      assert.calledWith(spy, null);
      spy.reset();

      // one-handed to two-handed
      user.ops.equip({params: {key: 'weapon_wizard_1'}}, spy);
      assert.calledOnce(spy);
      assert.calledWith(spy, null);
      spy.reset();

      // two-handed to two-handed
      user.ops.equip({params: {key: 'weapon_wizard_2'}}, spy);
      assert.calledOnce(spy);
      assert.calledWith(spy, null);
      spy.reset();

      // two-handed to one-handed
      user.ops.equip({params: {key: 'weapon_warrior_2'}}, spy);
      assert.calledOnce(spy);
      assert.calledWith(spy, null);
      spy.reset();
    });

    it('should send messages if equipping a two-hander causes the off-hander to be unequipped', () => {
      user.ops.equip({params: {key: 'weapon_warrior_1'}});
      user.ops.equip({params: {key: 'shield_warrior_1'}});

      // equipping two-hander
      user.ops.equip({params: {key: 'weapon_wizard_1'}}, spy);
      let weapon = content.gear.flat.weapon_wizard_1;
      let item = content.gear.flat.shield_warrior_1;
      let message = i18n.t('messageTwoHandedEquip', {twoHandedText: weapon.text(null), offHandedText: item.text(null)});

      assert.calledOnce(spy);
      assert.calledWith(spy, {code: 200, message});
    });

    it('should send messages if equipping an off-hand item causes a two-handed weapon to be unequipped', () => {
      // equipping two-hander
      user.ops.equip({params: {key: 'weapon_wizard_1'}});
      let weapon = content.gear.flat.weapon_wizard_1;
      let shield = content.gear.flat.shield_warrior_1;

      user.ops.equip({params: {key: 'shield_warrior_1'}}, spy);

      let message = i18n.t('messageTwoHandedUnequip', {twoHandedText: weapon.text(null), offHandedText: shield.text(null)});

      assert.calledOnce(spy);
      assert.calledWith(spy, {code: 200, message});
    });
  });
});
