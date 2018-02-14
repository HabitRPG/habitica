import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /user/buy-armoire', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'stats.gp': 400,
    });
  });

  // More tests in common code unit tests

  it('returns an error if user does not have enough gold', async () => {
    await user.update({
      'stats.gp': 5,
    });

    await expect(user.post('/user/buy-armoire'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageNotEnoughGold'),
      });
  });

  it('reduces gold when buying from the armoire', async () => {
    await user.post('/user/buy-armoire');

    await user.sync();

    expect(user.stats.gp).to.equal(300);
  });

  xit('buys a piece of armoire', async () => {
    // Skipped because can't stub predictableRandom correctly
  });
});
