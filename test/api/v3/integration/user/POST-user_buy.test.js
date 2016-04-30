import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import shared from '../../../../../common/script';

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
    });

    let potion = content.potion;
    let res = await user.post('/user/buy/potion');
    await user.sync();

    expect(user.stats.hp).to.equal(50);
    expect(res.data).to.eql(user.stats);
    expect(res.message).to.equal(t('messageBought', {itemText: potion.text()}));
  });

  it('buys a piece of gear', async () => {
    let key = 'armor_warrior_1';

    await user.post(`/user/buy/${key}`);
    await user.sync();

    expect(user.items.gear.owned).to.eql({ armor_warrior_1: true }); // eslint-disable-line camelcase
  });
});
