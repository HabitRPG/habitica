/* eslint-disable camelcase */

import nconf from 'nconf';
import {
  generateUser,
} from '../../../../helpers/api-v3-integration.helper';

describe('POST /debug/modify-inventory', () => {
  let user, originalItems;

  before(async () => {
    originalItems = {
      gear: { owned: { armor_base_0: true } },
      special: {
        snowball: 1,
      },
      pets: {
        'Wolf-Desert': 5,
      },
      mounts: {
        'Wolf-Desert': true,
      },
      eggs: {
        Wolf: 5,
      },
      hatchingPotions: {
        Desert: 5,
      },
      food: {
        Watermelon: 5,
      },
      quests: {
        gryphon: 5,
      },
    };
    user = await generateUser({
      items: originalItems,
    });
  });

  afterEach(() => {
    nconf.set('IS_PROD', false);
  });

  it('sets equipment', async () => {
    let gear = {
      weapon_healer_2: true,
      weapon_wizard_1: true,
      weapon_special_critical: true,
    };

    await user.post('/debug/modify-inventory', {
      gear,
    });

    await user.sync();

    expect(user.items.gear.owned).to.eql(gear);
  });

  it('sets special spells', async () => {
    let special = {
      shinySeed: 3,
    };

    await user.post('/debug/modify-inventory', {
      special,
    });

    await user.sync();

    expect(user.items.special).to.eql(special);
  });

  it('sets mounts', async () => {
    let mounts = {
      'Orca-Base': true,
      'Mammoth-Base': true,
    };

    await user.post('/debug/modify-inventory', {
      mounts,
    });

    await user.sync();

    expect(user.items.mounts).to.eql(mounts);
  });

  it('sets eggs', async () => {
    let eggs = {
      Gryphon: 3,
      Hedgehog: 7,
    };

    await user.post('/debug/modify-inventory', {
      eggs,
    });

    await user.sync();

    expect(user.items.eggs).to.eql(eggs);
  });

  it('sets hatching potions', async () => {
    let hatchingPotions = {
      White: 7,
      Spooky: 2,
    };

    await user.post('/debug/modify-inventory', {
      hatchingPotions,
    });

    await user.sync();

    expect(user.items.hatchingPotions).to.eql(hatchingPotions);
  });

  it('sets food', async () => {
    let food = {
      Meat: 5,
      Candy_Red: 7,
    };

    await user.post('/debug/modify-inventory', {
      food,
    });

    await user.sync();

    expect(user.items.food).to.eql(food);
  });

  it('sets quests', async () => {
    let quests = {
      whale: 5,
      cheetah: 10,
    };

    await user.post('/debug/modify-inventory', {
      quests,
    });

    await user.sync();

    expect(user.items.quests).to.eql(quests);
  });

  it('returns error when not in production mode', async () => {
    nconf.set('IS_PROD', true);

    await expect(user.post('/debug/modify-inventory'))
    .eventually.be.rejected.and.to.deep.equal({
      code: 404,
      error: 'NotFound',
      message: 'Not found.',
    });
  });
});
