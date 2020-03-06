/* eslint-disable camelcase */

import {
  generateUser,
} from '../../helpers/common.helper';
import {
  UNEQUIP_COSTUME,
  UNEQUIP_EQUIPPED,
  UNEQUIP_PET_MOUNT,
  unEquipByType,
} from '../../../website/common/script/ops/unequip';

describe('shared.ops.unequip', () => {
  let user;

  beforeEach(() => {
    user = generateUser({
      preferences: {
        background: 'violet',
      },
      items: {
        currentMount: 'BearCub-Base',
        currentPet: 'BearCub-Base',
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
            weapon: 'weapon_warrior_2',
            shield: 'shield_warrior_1',
          },
          costume: {
            weapon: 'weapon_warrior_2',
            shield: 'shield_warrior_1',
          },
        },
      },
      stats: { gp: 200 },
    });
  });

  context('Gear', () => {
    it('should unequip all battle gear items', () => {
      unEquipByType(user, { params: { type: UNEQUIP_EQUIPPED } });

      expect(user.items.gear.equipped.weapon).to.eq('weapon_base_0');
      expect(user.items.gear.equipped.shield).to.eq('shield_base_0');
    });
  });

  context('Costume', () => {
    it('should unequip all costume items', () => {
      unEquipByType(user, { params: { type: UNEQUIP_COSTUME } });

      expect(user.items.gear.costume.weapon).to.eq('weapon_base_0');
      expect(user.items.gear.costume.shield).to.eq('shield_base_0');
    });
  });

  context('Pet, Mount, Background', () => {
    it('should unequip Pet, Mount, Background', () => {
      unEquipByType(user, { params: { type: UNEQUIP_PET_MOUNT } });

      expect(user.items.currentMount).to.eq('');
      expect(user.items.currentPet).to.eq('');
      expect(user.preferences.background).to.eq('');
    });
  });
});
