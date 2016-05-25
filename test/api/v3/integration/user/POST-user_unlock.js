import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/unlock', () => {
  let user;
  let unlockPath = 'shirt.convict,shirt.cross,shirt.fire,shirt.horizon,shirt.ocean,shirt.purple,shirt.rainbow,shirt.redblue,shirt.thunder,shirt.tropical,shirt.zombie';
  let unlockCost = 1.25;
  let usersStartingGems = 5;

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
    let response = await user.post(`/user/unlock?path=${unlockPath}`);
    await user.sync();

    expect(response.message).to.equal(t('unlocked'));
    expect(user.balance).to.equal(usersStartingGems - unlockCost);
  });
});
