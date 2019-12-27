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

  function buyQuest (_user, _req, _analytics) {
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

  it('buys a Quest scroll', () => {
    user.stats.gp = 205;
    buyQuest(user, {
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

  it('if a user\'s count of a quest scroll is negative, it will be reset to 0 before incrementing when they buy a new one.', () => {
    user.stats.gp = 205;
    const key = 'dilatoryDistress1';
    user.items.quests[key] = -1;
    buyQuest(user, {
      params: { key },
    }, analytics);
    expect(user.items.quests[key]).to.equal(1);
    expect(user.stats.gp).to.equal(5);
    expect(analytics.track).to.be.calledOnce;
  });

  it('buys a Quest scroll with the right quantity if a string is passed for quantity', () => {
    user.stats.gp = 1000;
    buyQuest(user, {
      params: {
        key: 'dilatoryDistress1',
      },
    }, analytics);
    buyQuest(user, {
      params: {
        key: 'dilatoryDistress1',
      },
      quantity: '3',
    }, analytics);

    expect(user.items.quests).to.eql({
      dilatoryDistress1: 4,
    });
  });

  it('does not buy a Quest scroll when an invalid quantity is passed', done => {
    user.stats.gp = 1000;
    try {
      buyQuest(user, {
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
      done();
    }
  });

  it('does not buy Quests without enough Gold', done => {
    user.stats.gp = 1;
    try {
      buyQuest(user, {
        params: {
          key: 'dilatoryDistress1',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(1);
      done();
    }
  });

  it('does not buy nonexistent Quests', done => {
    user.stats.gp = 9999;
    try {
      buyQuest(user, {
        params: {
          key: 'snarfblatter',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotFound);
      expect(err.message).to.equal(errorMessage('questNotFound', { key: 'snarfblatter' }));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(9999);
      done();
    }
  });

  it('does not buy the Mystery of the Masterclassers', done => {
    try {
      buyQuest(user, {
        params: {
          key: 'lostMasterclasser1',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('questUnlockLostMasterclasser'));
      expect(user.items.quests).to.eql({});
      done();
    }
  });


  it('does not buy Gem-premium Quests', done => {
    user.stats.gp = 9999;
    try {
      buyQuest(user, {
        params: {
          key: 'kraken',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('questNotGoldPurchasable', { key: 'kraken' }));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(9999);
      done();
    }
  });

  it('returns error when key is not provided', done => {
    try {
      buyQuest(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(errorMessage('missingKeyParam'));
      done();
    }
  });

  it('does not buy a quest without completing previous quests', done => {
    try {
      buyQuest(user, {
        params: {
          key: 'dilatoryDistress3',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('mustComplete', { quest: 'dilatoryDistress2' }));
      expect(user.items.quests).to.eql({});
      done();
    }
  });
});
