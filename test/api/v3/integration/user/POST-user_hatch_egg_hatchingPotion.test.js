import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/hatch/:egg/:hatchingPotion', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('hatch a new pet', async () => {
    await user.update({
      'items.eggs.Wolf': 1,
      'items.hatchingPotions.Base': 1,
    });
    let res = await user.post('/user/hatch/Wolf/Base');
    await user.sync();
    expect(user.items.pets['Wolf-Base']).to.equal(5);
    expect(user.items.eggs.Wolf).to.equal(0);
    expect(user.items.hatchingPotions.Base).to.equal(0);

    expect(res).to.eql({
      message: t('messageHatched'),
      data: JSON.parse(JSON.stringify(user.items)),
    });
  });
});
