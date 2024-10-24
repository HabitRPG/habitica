import { BuySpellOperation } from '../../../../website/common/script/ops/buy/buySpell';
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
import { errorMessage } from '../../../../website/common/script/libs/errorMessage';

describe('shared.ops.buySpecialSpell', () => {
  let user;
  let clock;
  const analytics = { track () {} };

  async function buySpecialSpell (_user, _req, _analytics) {
    const buyOp = new BuySpellOperation(_user, _req, _analytics);

    return buyOp.purchase();
  }
  beforeEach(() => {
    user = generateUser();
    sinon.stub(analytics, 'track');
  });

  afterEach(() => {
    analytics.track.restore();
    if (clock) {
      clock.restore();
    }
  });

  it('throws an error if params.key is missing', async () => {
    try {
      await buySpecialSpell(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(errorMessage('missingKeyParam'));
    }
  });

  it('throws an error if the item doesn\'t exists', async () => {
    try {
      await buySpecialSpell(user, {
        params: {
          key: 'notExisting',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotFound);
      expect(err.message).to.equal(errorMessage('spellNotFound', { spellId: 'notExisting' }));
    }
  });

  it('throws an error if the user doesn\'t have enough gold', async () => {
    user.stats.gp = 1;
    try {
      await buySpecialSpell(user, {
        params: {
          key: 'thankyou',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
    }
  });

  describe('buying cards', () => {
    it('buys a card that is always available', async () => {
      user.stats.gp = 11;
      const item = content.special.thankyou;

      const [data, message] = await buySpecialSpell(user, {
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

    it('buys a limited card when it is available', async () => {
      user.stats.gp = 11;
      const item = content.special.nye;
      clock = sinon.useFakeTimers(new Date('2024-01-01'));

      const [data, message] = await buySpecialSpell(user, {
        params: {
          key: 'nye',
        },
      }, analytics);

      expect(user.stats.gp).to.equal(1);
      expect(user.items.special.nye).to.equal(1);
      expect(data).to.eql({
        items: user.items,
        stats: user.stats,
      });
      expect(message).to.equal(i18n.t('messageBought', {
        itemText: item.text(),
      }));
      expect(analytics.track).to.be.calledOnce;
    });

    it('throws an error if the card is not currently available', async () => {
      user.stats.gp = 11;
      clock = sinon.useFakeTimers(new Date('2024-06-01'));
      try {
        await buySpecialSpell(user, {
          params: {
            key: 'nye',
          },
        });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('cannotBuyItem'));
      }
    });
  });

  describe('buying spells', () => {
    it('buys a spell if it is currently available', async () => {
      user.stats.gp = 16;
      clock = sinon.useFakeTimers(new Date('2024-06-22'));
      const item = content.special.seafoam;
      const [data, message] = await buySpecialSpell(user, {
        params: {
          key: 'seafoam',
        },
      }, analytics);

      expect(user.stats.gp).to.equal(1);
      expect(user.items.special.seafoam).to.equal(1);
      expect(data).to.eql({
        items: user.items,
        stats: user.stats,
      });
      expect(message).to.equal(i18n.t('messageBought', {
        itemText: item.text(),
      }));
      expect(analytics.track).to.be.calledOnce;
    });

    it('throws an error if the spell is not currently available', async () => {
      user.stats.gp = 50;
      clock = sinon.useFakeTimers(new Date('2024-01-22'));
      try {
        await buySpecialSpell(user, {
          params: {
            key: 'seafoam',
          },
        });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('cannotBuyItem'));
      }
    });
  });
});
