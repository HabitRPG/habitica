import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/release-both', () => {
  let user;
  let animal = 'Wolf-Base';

  beforeEach(async () => {
    user = await generateUser({
      'items.currentMount': animal,
      'items.currentPet': animal,
      'items.pets': {animal: 5},
      'items.mounts': {animal: true},
    });
  });

  it('returns an error when user balance is too low and user does not have triadBingo', async () => {
    await expect(user.post('/user/release-both'))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notEnoughGems'),
      });
  });

  // More tests in common code unit tests

  it('grants triad bingo with gems', async () => {
    await user.update({
      balance: 1.5,
    });

    let response = await user.post('/user/release-both');
    await user.sync();

    expect(response.message).to.equal(t('mountsAndPetsReleased'));
    expect(user.balance).to.equal(0);
    expect(user.items.currentMount).to.be.empty;
    expect(user.items.currentPet).to.be.empty;
    expect(user.items.pets[animal]).to.be.empty;
    expect(user.items.mounts[animal]).to.equal(null);
    expect(user.achievements.beastMasterCount).to.equal(1);
    expect(user.achievements.mountMasterCount).to.equal(1);
    expect(user.achievements.triadBingoCount).to.equal(1);
  });
});
