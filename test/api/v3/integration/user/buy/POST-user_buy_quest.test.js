import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import shared from '../../../../../../website/common/script';
import apiError from '../../../../../../website/server/libs/apiError';

const { content } = shared;

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
        message: apiError('questNotFound', { key: 'notExisting' }),
      });
  });

  it('buys a quest', async () => {
    const key = 'dilatoryDistress1';
    const item = content.quests[key];

    await user.update({ 'stats.gp': 250 });
    const res = await user.post(`/user/buy-quest/${key}`);
    await user.sync();

    expect(res.data).to.eql(user.items.quests);
    expect(res.message).to.equal(t('messageBought', {
      itemText: item.text(),
    }));
  });

  it('returns an error if quest prerequisites are not met', async () => {
    const key = 'dilatoryDistress2';

    await expect(user.post(`/user/buy-quest/${key}`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('mustComplete', { quest: 'dilatoryDistress1' }),
      });
  });

  it('allows purchase of a quest if prerequisites are met', async () => {
    const prerequisite = 'dilatoryDistress1';
    const key = 'dilatoryDistress2';
    const item = content.quests[key];

    const achievementName = `achievements.quests.${prerequisite}`;

    await user.update({ [achievementName]: true, 'stats.gp': 9999 });
    const res = await user.post(`/user/buy-quest/${key}`);
    await user.sync();

    expect(res.data).to.eql(user.items.quests);
    expect(res.message).to.equal(t('messageBought', {
      itemText: item.text(),
    }));
  });
});
