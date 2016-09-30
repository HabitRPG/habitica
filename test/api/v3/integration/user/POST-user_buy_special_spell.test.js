import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import shared from '../../../../../website/common/script';

let content = shared.content;

describe('POST /user/buy-special-spell/:key', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('returns an error if the special spell is not found', async () => {
    await expect(user.post('/user/buy-special-spell/notExisting'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('spellNotFound', {spellId: 'notExisting'}),
      });
  });

  it('buys a special spell', async () => {
    let key = 'thankyou';
    let item = content.special[key];

    await user.update({'stats.gp': 250});
    let res = await user.post(`/user/buy-special-spell/${key}`);
    await user.sync();

    expect(res.data).to.eql({
      items: JSON.parse(JSON.stringify(user.items)), // otherwise dates can't be compared
      stats: user.stats,
    });
    expect(res.message).to.equal(t('messageBought', {
      itemText: item.text(),
    }));
  });
});
