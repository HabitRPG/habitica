import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/unlock', () => {
  let user;
  const unlockPath = 'shirt.convict,shirt.cross,shirt.fire,shirt.horizon,shirt.ocean,shirt.purple,shirt.rainbow,shirt.redblue,shirt.thunder,shirt.tropical,shirt.zombie';
  const unlockGearSetPath = 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars';
  const unlockCost = 1.25;
  const usersStartingGems = 5;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error when user balance is too low', async () => {
    await expect(user.post(`/user/unlock?path=${unlockPath}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notEnoughGems'),
      });
  });

  // More tests in common code unit tests

  it('reduces a user\'s balance', async () => {
    await user.update({
      balance: usersStartingGems,
    });
    const response = await user.post(`/user/unlock?path=${unlockPath}`);
    await user.sync();

    expect(response.message).to.equal(t('unlocked'));
    expect(user.balance).to.equal(usersStartingGems - unlockCost);
  });

  it('does not reduce a user\'s balance twice', async () => {
    await user.update({
      balance: usersStartingGems,
    });
    const response = await user.post(`/user/unlock?path=${unlockGearSetPath}`);
    await user.sync();

    expect(response.message).to.equal(t('unlocked'));
    expect(user.balance).to.equal(usersStartingGems - unlockCost);

    expect(user.post(`/user/unlock?path=${unlockGearSetPath}`))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('alreadyUnlocked'),
      });
    await user.sync();

    expect(user.balance).to.equal(usersStartingGems - unlockCost);
  });
});
