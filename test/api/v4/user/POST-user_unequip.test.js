import {
  generateUser,
} from '../../../helpers/api-integration/v4';
import { UNEQUIP_EQUIPPED } from '../../../../website/common/script/ops/unequip';

describe('POST /user/unequip', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
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

  // More tests in common code unit tests

  context('Gear', () => {
    it('should unequip all battle gear items', async () => {
      await user.post(`/user/unequip/${UNEQUIP_EQUIPPED}`);
      await user.sync();

      expect(user.items.gear.equipped.weapon).to.eq('weapon_base_0');
      expect(user.items.gear.equipped.shield).to.eq('shield_base_0');
    });
  });
});
