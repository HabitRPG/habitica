import {
  generateUser,
} from '../../../helpers/common.helper';
import buyQuest from '../../../../website/common/script/ops/buyQuest';
import {
  NotAuthorized,
  NotFound,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';

describe('shared.ops.buyQuest', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('buys a Quest scroll', () => {
    user.stats.gp = 205;
    buyQuest(user, {
      params: {
        key: 'dilatoryDistress1',
      },
    });
    expect(user.items.quests).to.eql({
      dilatoryDistress1: 1,
    });
    expect(user.stats.gp).to.equal(5);
  });

  it('does not buy Quests without enough Gold', (done) => {
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

  it('does not buy nonexistent Quests', (done) => {
    user.stats.gp = 9999;
    try {
      buyQuest(user, {
        params: {
          key: 'snarfblatter',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotFound);
      expect(err.message).to.equal(i18n.t('questNotFound', {key: 'snarfblatter'}));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(9999);
      done();
    }
  });

  it('does not buy Gem-premium Quests', (done) => {
    user.stats.gp = 9999;
    try {
      buyQuest(user, {
        params: {
          key: 'kraken',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('questNotGoldPurchasable', {key: 'kraken'}));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(9999);
      done();
    }
  });
});
