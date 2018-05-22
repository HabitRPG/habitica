import {BuySpellOperation} from '../../../../website/common/script/ops/buy/buySpell';
import {
  BadRequest,
  NotFound,
  NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import {
  generateUser,
} from '../../../helpers/common.helper';
import content from '../../../../website/common/script/content/index';
import errorMessage from '../../../../website/common/script/libs/errorMessage';

describe('shared.ops.buySpecialSpell', () => {
  let user;
  let analytics = {track () {}};

  function buySpecialSpell (_user, _req, _analytics) {
    const buyOp = new BuySpellOperation(_user, _req, _analytics);

    return buyOp.purchase();
  }
  beforeEach(() => {
    user = generateUser();
    sinon.stub(analytics, 'track');
  });

  afterEach(() => {
    analytics.track.restore();
  });

  it('throws an error if params.key is missing', (done) => {
    try {
      buySpecialSpell(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(errorMessage('missingKeyParam'));
      done();
    }
  });

  it('throws an error if the spell doesn\'t exists', (done) => {
    try {
      buySpecialSpell(user, {
        params: {
          key: 'notExisting',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotFound);
      expect(err.message).to.equal(errorMessage('spellNotFound', {spellId: 'notExisting'}));
      done();
    }
  });

  it('throws an error if the user doesn\'t have enough gold', (done) => {
    user.stats.gp = 1;
    try {
      buySpecialSpell(user, {
        params: {
          key: 'thankyou',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
      done();
    }
  });

  it('buys an item', () => {
    user.stats.gp = 11;
    let item = content.special.thankyou;

    let [data, message] = buySpecialSpell(user, {
      params: {
        key: 'thankyou',
      },
    }, analytics);

    expect(user.stats.gp).to.equal(1);
    expect(user.items.special.thankyou).to.equal(1);
    expect(data).to.eql({
      items: user.items,
      stats: user.stats,
    });
    expect(message).to.equal(i18n.t('messageBought', {
      itemText: item.text(),
    }));
    expect(analytics.track).to.be.calledOnce;
  });
});
