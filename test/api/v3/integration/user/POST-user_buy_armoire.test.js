import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import shared from '../../../../../common/script';

let content = shared.content;

describe('POST /user/buy-armoire', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'stats.hp': 40,
    });
  });

  // More tests in common code unit tests

  it('returns an error if user does not have enough gold', async () => {
    await expect(user.post('/user/buy-health-potion'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageNotEnoughGold'),
      });
  });

  xit('buys a piece of armoire', async () => {
    await user.update({
      'stats.gp': 400,
    });

    let potion = content.potion;
    let res = await user.post('/user/buy-health-potion');
    await user.sync();

    expect(user.stats.hp).to.equal(50);
    expect(res.data).to.eql({
      stats: user.stats,
    });
    expect(res.message).to.equal(t('messageBought', {itemText: potion.text()}));
  });
});
