import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/move-pinned-item/:path/move/to/:position', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('adjusts the order of pinned items with no order mismatch', async () => {
    await user.update({
      'pinnedItemsOrder':
        ["hatchingPotions.Golden",
         "cardTypes.greeting",
         "armoire",
         "gear.flat.weapon_warrior_1",
         "gear.flat.head_warrior_1",
         "cardTypes.thankyou",
         "gear.flat.armor_warrior_1",
         "food.Saddle",
         "gear.flat.shield_warrior_1",
         "potion"],
    });

    // Need to actually generate these items for the user, the new user will just have the base stuff and if they are different the pinnedItemsOrder will be overwritten

    let res = await user.post('/user/move-pinned-item/armoire/move/to/5');
    await user.sync();

    // Heck this is probably a good test. If mismatched overwrite items order first

    expect(user.items.pets['Wolf-Base']).to.equal(5);
    expect(user.items.eggs.Wolf).to.equal(0);
    expect(user.items.hatchingPotions.Base).to.equal(0);

    expect(res).to.eql({
      message: t('messageHatched'),
      data: JSON.parse(JSON.stringify(user.items)),
    });
  });

  it( 'adjusts the order of pinned items with order mismatch', async () => {

  });
});
