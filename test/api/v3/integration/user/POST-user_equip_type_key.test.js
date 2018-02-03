/* eslint-disable camelcase */

import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/equip/:type/:key', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('equip an item', async () => {
    await user.update({
      'items.gear.owned': {
        weapon_warrior_0: true,
        weapon_warrior_1: true,
        weapon_warrior_2: true,
        weapon_wizard_1: true,
        weapon_wizard_2: true,
        shield_base_0: true,
        shield_warrior_1: true,
      },
      'items.gear.equipped': {
        weapon: 'weapon_warrior_0',
        shield: 'shield_base_0',
      },
      'stats.gp': 200,
    });

    await user.post('/user/equip/equipped/weapon_warrior_1');
    let res = await user.post('/user/equip/equipped/weapon_warrior_2');
    await user.sync();

    expect(res).to.eql(JSON.parse(JSON.stringify(user.items)));
  });
});
