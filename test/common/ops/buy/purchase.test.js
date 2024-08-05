import forEach from 'lodash/forEach';
import moment from 'moment';
import purchase from '../../../../website/common/script/ops/buy/purchase';
import * as pinnedGearUtils from '../../../../website/common/script/ops/pinnedGearUtils';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import {
  generateUser,
} from '../../../helpers/common.helper';

describe('shared.ops.purchase', () => {
  const SEASONAL_FOOD = moment().isBefore('2021-11-02T20:00-04:00') ? 'Candy_Base' : 'Meat';
  let user;
  let clock;
  const goldPoints = 40;
  const analytics = { track () {} };

  before(() => {
    user = generateUser({ 'stats.class': 'rogue' });
  });

  beforeEach(() => {
    sinon.stub(analytics, 'track');
    sinon.spy(pinnedGearUtils, 'removeItemByPath');
    clock = sandbox.useFakeTimers(new Date('2024-01-10'));
  });

  afterEach(() => {
    analytics.track.restore();
    pinnedGearUtils.removeItemByPath.restore();
    clock.restore();
  });

  context('failure conditions', () => {
    it('returns an error when type is not provided', async () => {
      try {
        await purchase(user, { params: {} });
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('typeRequired'));
      }
    });

    it('returns error when unknown type is provided', async () => {
      try {
        await purchase(user, { params: { type: 'randomType', key: 'gem' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('notAccteptedType'));
      }
    });

    it('returns error when user attempts to purchase a piece of gear they own', async () => {
      user.items.gear.owned['shield_rogue_1'] = true; // eslint-disable-line dot-notation

      try {
        await purchase(user, { params: { type: 'gear', key: 'shield_rogue_1' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('alreadyHave'));
      }
    });

    it('returns error when unknown item is requested', async () => {
      try {
        await purchase(user, { params: { type: 'gear', key: 'randomKey' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('contentKeyNotFound', { type: 'gear' }));
      }
    });

    it('returns error when user does not have permission to buy an item', async () => {
      try {
        await purchase(user, { params: { type: 'gear', key: 'eyewear_mystery_301405' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotAvailable'));
      }
    });

    it('returns error when user does not have enough gems to buy an item', async () => {
      try {
        await purchase(user, { params: { type: 'gear', key: 'shield_special_winter2019Healer' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('notEnoughGems'));
      }
    });

    it('returns error when gear is not available', async () => {
      try {
        await purchase(user, { params: { type: 'gear', key: 'shield_special_spring2019Healer' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotAvailable'));
      }
    });

    it('returns an error when purchasing current seasonal gear', async () => {
      user.balance = 2;
      try {
        await purchase(user, { params: { type: 'gear', key: 'shield_special_winter2024Healer' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotAvailable'));
      }
    });

    it('returns error when hatching potion is not available', async () => {
      try {
        await purchase(user, { params: { type: 'hatchingPotions', key: 'PolkaDot' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotAvailable'));
      }
    });

    it('returns error when quest for hatching potion was not yet completed', async () => {
      try {
        await purchase(user, { params: { type: 'hatchingPotions', key: 'BlackPearl' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotAvailable'));
      }
    });

    it('returns error when quest for egg was not yet completed', async () => {
      try {
        await purchase(user, { params: { type: 'eggs', key: 'Octopus' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotAvailable'));
      }
    });

    it('returns error when bundle is not available', async () => {
      try {
        await purchase(user, { params: { type: 'bundles', key: 'forestFriends' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('notAvailable'));
      }
    });

    it('returns error when gear is not gem purchasable', async () => {
      try {
        await purchase(user, { params: { type: 'gear', key: 'shield_healer_3' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotAvailable'));
      }
    });

    it('returns error when item is not found', async () => {
      const params = { key: 'notExisting', type: 'food' };

      try {
        await purchase(user, { params });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('contentKeyNotFound', params));
      }
    });
  });

  context('successful purchase', () => {
    const userGemAmount = 10;

    before(() => {
      user.balance = userGemAmount;
      user.stats.gp = goldPoints;
      user.purchased.plan.gemsBought = 0;
      user.purchased.plan.customerId = 'customer-id';
      user.pinnedItems.push({ type: 'eggs', key: 'Wolf' });
      user.pinnedItems.push({ type: 'hatchingPotions', key: 'Base' });
      user.pinnedItems.push({ type: 'food', key: SEASONAL_FOOD });
      user.pinnedItems.push({ type: 'gear', key: 'shield_special_winter2019Healer' });
      user.pinnedItems.push({ type: 'bundles', key: 'featheredFriends' });
    });

    it('purchases eggs', async () => {
      const type = 'eggs';
      const key = 'Wolf';

      await purchase(user, { params: { type, key } }, analytics);

      expect(user.items[type][key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
      expect(analytics.track).to.be.calledOnce;
    });

    it('purchases hatchingPotions', async () => {
      const type = 'hatchingPotions';
      const key = 'Base';

      await purchase(user, { params: { type, key } });

      expect(user.items[type][key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
    });

    it('purchases food', async () => {
      const type = 'food';
      const key = SEASONAL_FOOD;

      await purchase(user, { params: { type, key } });

      expect(user.items[type][key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
    });

    it('purchases past seasonal gear', async () => {
      const type = 'gear';
      const key = 'shield_special_winter2019Healer';

      await purchase(user, { params: { type, key } });

      expect(user.items.gear.owned[key]).to.be.true;
      expect(pinnedGearUtils.removeItemByPath.calledOnce).to.equal(true);
    });

    it('purchases hatching potion', async () => {
      const type = 'hatchingPotions';
      const key = 'Peppermint';

      await purchase(user, { params: { type, key } });

      expect(user.items.hatchingPotions[key]).to.eql(1);
    });

    it('purchases event hatching potion', async () => {
      clock.restore();
      clock = sandbox.useFakeTimers(moment('2022-04-10').valueOf());
      const type = 'hatchingPotions';
      const key = 'Veggie';

      await purchase(user, { params: { type, key } });

      expect(user.items.hatchingPotions[key]).to.eql(1);
    });

    it('purchases hatching potion if user completed quest', async () => {
      const type = 'hatchingPotions';
      const key = 'Bronze';
      user.achievements.quests.bronze = 1;

      await purchase(user, { params: { type, key } });

      expect(user.items.hatchingPotions[key]).to.eql(1);
    });

    it('purchases egg if user completed quest', async () => {
      const type = 'eggs';
      const key = 'Deer';
      user.achievements.quests.ghost_stag = 1;

      await purchase(user, { params: { type, key } });

      expect(user.items.eggs[key]).to.eql(1);
    });

    it('purchases quest bundles', async () => {
      const startingBalance = user.balance;
      clock.restore();
      clock = sandbox.useFakeTimers(moment('2022-03-10').valueOf());
      const type = 'bundles';
      const key = 'cuddleBuddies';
      const price = 1.75;
      const questList = [
        'bunny',
        'ferret',
        'guineapig',
      ];

      await purchase(user, { params: { type, key } });

      forEach(questList, bundledKey => {
        expect(user.items.quests[bundledKey]).to.equal(1);
      });

      expect(user.balance).to.equal(startingBalance - price);

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
      const type = 'eggs';
      const key = 'TigerCub';

      try {
        await purchase(user, {
          params: { type, key },
          quantity: 2,
        });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('notEnoughGems'));
      }
    });

    it('makes bulk purchases of eggs', async () => {
      const type = 'eggs';
      const key = 'TigerCub';

      await purchase(user, {
        params: { type, key },
        quantity: 2,
      });

      expect(user.items[type][key]).to.equal(2);
    });

    it('returns error when user supplies a non-numeric quantity', async () => {
      const type = 'eggs';
      const key = 'Wolf';

      try {
        await purchase(user, { params: { type, key }, quantity: 'jamboree' }, analytics);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('invalidQuantity'));
      }
    });

    it('returns error when user supplies a negative quantity', async () => {
      const type = 'eggs';
      const key = 'Wolf';
      user.balance = 10;

      try {
        await purchase(user, { params: { type, key }, quantity: -2 }, analytics);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('invalidQuantity'));
      }
    });

    it('returns error when user supplies a decimal quantity', async () => {
      const type = 'eggs';
      const key = 'Wolf';
      user.balance = 10;

      try {
        await purchase(user, { params: { type, key }, quantity: 2.9 }, analytics);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('invalidQuantity'));
      }
    });
  });
});
