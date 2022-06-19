import {
  generateUser,
} from '../../../helpers/common.helper';
import { BuyQuestWithGoldOperation } from '../../../../website/common/script/ops/buy/buyQuestGold';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import errorMessage from '../../../../website/common/script/libs/errorMessage';

describe('shared.ops.buyQuest', () => {
  let user;
  const analytics = { track () {} };

  async function buyQuest (_user, _req, _analytics) {
    const buyOp = new BuyQuestWithGoldOperation(_user, _req, _analytics);

    return buyOp.purchase();
  }

  beforeEach(() => {
    user = generateUser();
    sinon.stub(analytics, 'track');
  });

  afterEach(() => {
    analytics.track.restore();
  });

  it('buys a Quest scroll', async () => {
    user.stats.gp = 205;
    await buyQuest(user, {
      params: {
        key: 'dilatoryDistress1',
      },
    }, analytics);
    expect(user.items.quests).to.eql({
      dilatoryDistress1: 1,
    });
    expect(user.stats.gp).to.equal(5);
    expect(analytics.track).to.be.calledOnce;
  });

  it('if a user\'s count of a quest scroll is negative, it will be reset to 0 before incrementing when they buy a new one.', async () => {
    user.stats.gp = 205;
    const key = 'dilatoryDistress1';
    user.items.quests[key] = -1;
    await buyQuest(user, {
      params: { key },
    }, analytics);
    expect(user.items.quests[key]).to.equal(1);
    expect(user.stats.gp).to.equal(5);
    expect(analytics.track).to.be.calledOnce;
  });

  it('buys a Quest scroll with the right quantity if a string is passed for quantity', async () => {
    user.stats.gp = 1000;
    await buyQuest(user, {
      params: {
        key: 'dilatoryDistress1',
      },
    }, analytics);
    await buyQuest(user, {
      params: {
        key: 'dilatoryDistress1',
      },
      quantity: '3',
    }, analytics);

    expect(user.items.quests).to.eql({
      dilatoryDistress1: 4,
    });
  });

  it('does not buy a Quest scroll when an invalid quantity is passed', async () => {
    user.stats.gp = 1000;
    try {
      await buyQuest(user, {
        params: {
          key: 'dilatoryDistress1',
        },
        quantity: 'a',
      }, analytics);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidQuantity'));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(1000);
    }
  });

  it('does not buy Quests without enough Gold', async () => {
    user.stats.gp = 1;
    try {
      await buyQuest(user, {
        params: {
          key: 'dilatoryDistress1',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(1);
    }
  });

  it('does not buy nonexistent Quests', async () => {
    user.stats.gp = 9999;
    try {
      await buyQuest(user, {
        params: {
          key: 'snarfblatter',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotFound);
      expect(err.message).to.equal(errorMessage('questNotFound', { key: 'snarfblatter' }));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(9999);
    }
  });

  it('does not buy the Mystery of the Masterclassers', async () => {
    try {
      await buyQuest(user, {
        params: {
          key: 'lostMasterclasser1',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('questUnlockLostMasterclasser'));
      expect(user.items.quests).to.eql({});
    }
  });

  it('does not buy Gem-premium Quests', async () => {
    user.stats.gp = 9999;
    try {
      await buyQuest(user, {
        params: {
          key: 'kraken',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('questNotGoldPurchasable', { key: 'kraken' }));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(9999);
    }
  });

  it('returns error when key is not provided', async () => {
    try {
      await buyQuest(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(errorMessage('missingKeyParam'));
    }
  });

  it('returns error if user has not completed all prerequisite quests', async () => {
    user.stats.gp = 9999;
    user.achievements.quests.dilatoryDistress1 = 1;
    try {
      await buyQuest(user, {
        params: {
          key: 'dilatoryDistress3',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('mustComplete', { quest: 'dilatoryDistress2' }));
      expect(user.items.quests).to.eql({});
    }
  });

  it('successfully purchases quest if user has completed all prerequisite quests', async () => {
    user.stats.gp = 500;
    user.achievements.quests.dilatoryDistress1 = 1;
    user.achievements.quests.dilatoryDistress2 = 1;

    await buyQuest(user, {
      params: {
        key: 'dilatoryDistress3',
      },
    }, analytics);

    expect(user.items.quests).to.eql({
      dilatoryDistress3: 1,
    });
    expect(user.stats.gp).to.equal(100);
    expect(analytics.track).to.be.calledOnce;
  });
});
