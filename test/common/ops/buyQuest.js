import {
  generateUser,
} from '../../helpers/common.helper';
import buyQuest from '../../../common/script/ops/buyQuest';
import {
  NotAuthorized,
  NotFound,
} from '../../../common/script/libs/errors';
import i18n from '../../../common/script/i18n';

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

  it('does not buy Quests without enough Gold', () => {
    user.stats.gp = 1;
    try {
      expect(buyQuest(user, {
        params: {
          key: 'dilatoryDistress1',
        },
      })).to.throw(NotAuthorized);
    } catch (err) {
      expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(1);
    }
  });

  it('does not buy nonexistent Quests', () => {
    user.stats.gp = 9999;
    try {
      expect(buyQuest(user, {
        params: {
          key: 'snarfblatter',
        },
      })).to.throw(NotFound);
    } catch (err) {
      expect(err.message).to.equal(i18n.t('questNotFound', {key: 'snarfblatter'}));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(9999);
    }
  });

  it('does not buy Gem-premium Quests', () => {
    user.stats.gp = 9999;
    try {
      expect(buyQuest(user, {
        params: {
          key: 'kraken',
        },
      })).to.throw(NotAuthorized);
    } catch (err) {
      expect(err.message).to.equal(i18n.t('questNotGoldPurchasable', {key: 'kraken'}));
      expect(user.items.quests).to.eql({});
      expect(user.stats.gp).to.equal(9999);
    }
  });
});
