import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import shared from '../../../../../../website/common/script';

let content = shared.content;

describe('POST /user/buy-quest/:key', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('returns an error if the quest is not found', async () => {
    await expect(user.post('/user/buy-quest/notExisting'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('questNotFound', {key: 'notExisting'}),
      });
  });

  it('buys a quest', async () => {
    let key = 'dilatoryDistress1';
    let item = content.quests[key];

    await user.update({'stats.gp': 250});
    let res = await user.post(`/user/buy-quest/${key}`);
    await user.sync();

    expect(res.data).to.eql(user.items.quests);
    expect(res.message).to.equal(t('messageBought', {
      itemText: item.text(),
    }));
  });
});
