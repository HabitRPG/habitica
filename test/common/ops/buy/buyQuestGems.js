import * as pinnedGearUtils from '../../../../website/common/script/ops/pinnedGearUtils';
import {
  NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import {
  generateUser,
} from '../../../helpers/common.helper';
import { BuyQuestWithGemOperation } from '../../../../website/common/script/ops/buy/buyQuestGem';

describe('shared.ops.buyQuestGems', () => {
  let user;
  const goldPoints = 40;
  const analytics = { track () {} };

  function buyQuest (_user, _req, _analytics) {
    const buyOp = new BuyQuestWithGemOperation(_user, _req, _analytics);

    return buyOp.purchase();
  }

  before(() => {
    user = generateUser({ 'stats.class': 'rogue' });
  });

  beforeEach(() => {
    sinon.stub(analytics, 'track');
    sinon.spy(pinnedGearUtils, 'removeItemByPath');
  });

  afterEach(() => {
    analytics.track.restore();
    pinnedGearUtils.removeItemByPath.restore();
  });

  context('successful purchase', () => {
    const userGemAmount = 10;

    before(() => {
      user.balance = userGemAmount;
      user.stats.gp = goldPoints;
      user.purchased.plan.gemsBought = 0;
      user.purchased.plan.customerId = 'customer-id';
      user.pinnedItems.push({ type: 'quests', key: 'gryphon' });
    });

    it('purchases quests', () => {
      const key = 'gryphon';

      buyQuest(user, { params: { key } });

      expect(user.items.quests[key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
    });
    it('if a user\'s count of a quest scroll is negative, it will be reset to 0 before incrementing when they buy a new one.', () => {
      const key = 'dustbunnies';
      user.items.quests[key] = -1;

      buyQuest(user, { params: { key } });

      expect(user.items.quests[key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
    });
  });

  context('bulk purchase', () => {
    const userGemAmount = 10;

    beforeEach(() => {
      user.balance = userGemAmount;
      user.stats.gp = goldPoints;
      user.purchased.plan.gemsBought = 0;
      user.purchased.plan.customerId = 'customer-id';
    });

    it('errors when user does not have enough gems', done => {
      user.balance = 1;
      const key = 'gryphon';

      try {
        buyQuest(user, {
          params: { key },
          quantity: 2,
        });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('notEnoughGems'));
        done();
      }
    });

    it('makes bulk purchases of quests', () => {
      const key = 'gryphon';

      buyQuest(user, {
        params: { key },
        quantity: 3,
      });

      expect(user.items.quests[key]).to.equal(4);
    });
  });
});
