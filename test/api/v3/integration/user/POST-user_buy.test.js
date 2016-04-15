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

  it('buys an item', async () => {
    let potion = content.potion;
    let res = await user.post('/user/buy/potion');
    await user.sync();

    expect(res.data).to.eql({
      items: JSON.parse(JSON.stringify(user.items)), // otherwise dates can't be compared
      achievements: user.achievements,
      stats: user.stats,
      flags: JSON.parse(JSON.stringify(user.flags)), // otherwise dates can't be compared
    });
    expect(res.message).to.equal(t('messageBought', {itemText: potion.text()}));
  });
});
