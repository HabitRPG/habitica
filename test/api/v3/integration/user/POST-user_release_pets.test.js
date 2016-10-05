import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/release-pets', () => {
  let user;
  let animal = 'Wolf-Base';

  beforeEach(async () => {
    user = await generateUser({
      'items.currentPet': animal,
      'items.pets': {animal: 5},
    });
  });

  it('returns an error when user balance is too low', async () => {
    await expect(user.post('/user/release-pets'))
      .to.eventually.be.rejected.and.to.eql({
        code: 403,
        error: 'Forbidden',
        message: t('notEnoughGems'),
      });
  });

  // More tests in common code unit tests

  it('releases pets', async () => {
    await user.update({
      balance: 1,
    });

    let response = await user.post('/user/release-pets');
    await user.sync();

    expect(response.message).to.equal(t('petsReleased'));
    expect(user.balance).to.equal(0);
    expect(user.items.currentPet).to.be.empty;
    expect(user.items.pets[animal]).to.equal(0);
    expect(user.achievements.beastMasterCount).to.equal(1);
  });
});
