/* eslint-disable camelcase */

import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import shared from '../../../../../website/common/script';

let content = shared.content;

describe('POST /user/buy/:key', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'stats.gp': 400,
    });
  });

  // More tests in common code unit tests

  it('returns an error if the item is not found', async () => {
    await expect(user.post('/user/buy/notExisting'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('itemNotFound', {key: 'notExisting'}),
      });
  });

  it('buys a potion', async () => {
    await user.update({
      'stats.gp': 400,
      'stats.hp': 40,
    });

    let potion = content.potion;
    let res = await user.post('/user/buy/potion');
    await user.sync();

    expect(user.stats.hp).to.equal(50);
    expect(res.data).to.eql(user.stats);
    expect(res.message).to.equal(t('messageBought', {itemText: potion.text()}));
  });

  it('returns an error if user tries to buy a potion with full health', async () => {
    await user.update({
      'stats.gp': 40,
      'stats.hp': 50,
    });

    await expect(user.post('/user/buy/potion'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageHealthAlreadyMax'),
      });
  });
  it('buys a piece of gear', async () => {
    let key = 'armor_warrior_1';

    await user.post(`/user/buy/${key}`);
    await user.sync();

    expect(user.items.gear.owned).to.eql({
      armor_warrior_1: true,
      eyewear_special_blackTopFrame: true,
      eyewear_special_blueTopFrame: true,
      eyewear_special_greenTopFrame: true,
      eyewear_special_pinkTopFrame: true,
      eyewear_special_redTopFrame: true,
      eyewear_special_whiteTopFrame: true,
      eyewear_special_yellowTopFrame: true,
    });
  });
});
