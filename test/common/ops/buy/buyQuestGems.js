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

  async function buyQuest (_user, _req, _analytics) {
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

  context('single purchase', () => {
    const userGemAmount = 10;

    before(() => {
      user.balance = userGemAmount;
      user.stats.gp = goldPoints;
      user.purchased.plan.gemsBought = 0;
      user.purchased.plan.customerId = 'customer-id';
      user.pinnedItems.push({ type: 'quests', key: 'gryphon' });
    });

    it('successfully purchases quest', async () => {
      const key = 'gryphon';

      await buyQuest(user, { params: { key } });

      expect(user.items.quests[key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
    });
    it('if a user\'s count of a quest scroll is negative, it will be reset to 0 before incrementing when they buy a new one.', async () => {
      const key = 'dustbunnies';
      user.items.quests[key] = -1;

      await buyQuest(user, { params: { key } });

      expect(user.items.quests[key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
    });
    it('errors if the user has not completed prerequisite quests', async () => {
      const key = 'atom3';
      user.achievements.quests.atom1 = 1;

      try {
        await buyQuest(user, { params: { key } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('mustComplete', { quest: 'atom2' }));
        expect(user.items.quests[key]).to.eql(undefined);
      }
    });
    it('successfully purchases quest if user has completed all prerequisite quests', async () => {
      const key = 'atom3';
      user.achievements.quests.atom1 = 1;
      user.achievements.quests.atom2 = 1;

      await buyQuest(user, { params: { key } });

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

    it('errors when user does not have enough gems', async () => {
      user.balance = 1;
      const key = 'gryphon';

      try {
        await buyQuest(user, {
          params: { key },
          quantity: 2,
        });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('notEnoughGems'));
      }
    });

    it('makes bulk purchases of quests', async () => {
      const key = 'gryphon';

      await buyQuest(user, {
        params: { key },
        quantity: 3,
      });

      expect(user.items.quests[key]).to.equal(4);
    });
  });
});
