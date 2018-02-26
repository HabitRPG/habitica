import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/move-pinned-item/:path/move/to/:position', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it.only('adjusts the order of pinned items with no order mismatch', async () => {
    await user.update({
      'pinnedItems': [
        { type: 'armoire', path: 'armoire' },
        { type: 'potion', path: 'potion' },
        { type: 'marketGear', path: 'gear.flat.weapon_warrior_1' },
        { type: 'marketGear', path: 'gear.flat.head_warrior_1' },
        { type: 'marketGear', path: 'gear.flat.armor_warrior_1' },
        { type: 'hatchingPotions', path: 'hatchingPotions.Golden' },
        { type: 'marketGear', path: 'gear.flat.shield_warrior_1' },
        { type: 'card', path: 'cardTypes.greeting' },
        { type: 'potion', path: 'hatchingPotions.Golden' },
        { type: 'card', path: 'cardTypes.thankyou' },
        { type: 'food', path: 'food.Saddle' }
      ],
      'pinnedItemsOrder': [
        'hatchingPotions.Golden',
        'cardTypes.greeting',
        'armoire',
        'gear.flat.weapon_warrior_1',
        'gear.flat.head_warrior_1',
        'cardTypes.thankyou',
        'gear.flat.armor_warrior_1',
        'food.Saddle',
        'gear.flat.shield_warrior_1',
        'potion'
      ],
      });

    let res = await user.post('/user/move-pinned-item/armoire/move/to/5');
    await user.sync();

    expect(user.pinnedItemsOrder[5]).to.equal('armoire');
    expect(user.pinnedItemsOrder[2]).to.equal('gear.flat.weapon_warrior_1');
    // The same as pinned items but now armoire is in position 5
    expect(res).to.eql([
      'hatchingPotions.Golden',
      'cardTypes.greeting',
      'gear.flat.weapon_warrior_1',
      'gear.flat.head_warrior_1',
      'cardTypes.thankyou',
      'armoire',
      'gear.flat.armor_warrior_1',
      'food.Saddle',
      'gear.flat.shield_warrior_1',
      'potion'
    ]);
  });

  it( 'adjusts the order of pinned items with order mismatch', async () => {

  });

  it( 'adjusts the order of pinned items with additional seasonal items', async () => {
    // This is an important test but I am not sure how to do it

  });
});
