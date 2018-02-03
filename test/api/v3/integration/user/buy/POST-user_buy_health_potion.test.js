import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import shared from '../../../../../../website/common/script';

let content = shared.content;

describe('POST /user/buy-health-potion', () => {
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

  it('buys a potion', async () => {
    await user.update({
      'stats.gp': 400,
    });

    let potion = content.potion;
    let res = await user.post('/user/buy-health-potion');
    await user.sync();

    expect(user.stats.hp).to.equal(50);
    expect(res.data).to.eql(user.stats);
    expect(res.message).to.equal(t('messageBought', {itemText: potion.text()}));
  });
});
