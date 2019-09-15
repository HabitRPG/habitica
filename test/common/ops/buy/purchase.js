import purchase from '../../../../website/common/script/ops/buy/purchase';
import pinnedGearUtils from '../../../../website/common/script/ops/pinnedGearUtils';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import {
  generateUser,
} from '../../../helpers/common.helper';
import forEach from 'lodash/forEach';
import moment from 'moment';

describe('shared.ops.purchase', () => {
  const SEASONAL_FOOD = 'Meat';
  let user;
  let goldPoints = 40;
  let analytics = {track () {}};

  before(() => {
    user = generateUser({'stats.class': 'rogue'});
  });

  beforeEach(() => {
    sinon.stub(analytics, 'track');
    sinon.spy(pinnedGearUtils, 'removeItemByPath');
  });

  afterEach(() => {
    analytics.track.restore();
    pinnedGearUtils.removeItemByPath.restore();
  });

  context('failure conditions', () => {
    it('returns an error when type is not provided', (done) => {
      try {
        purchase(user, {params: {}});
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('typeRequired'));
        done();
      }
    });


    it('returns error when unknown type is provided', (done) => {
      try {
        purchase(user, {params: {type: 'randomType', key: 'gem'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('notAccteptedType'));
        done();
      }
    });

    it('returns error when user attempts to purchase a piece of gear they own', (done) => {
      user.items.gear.owned['shield_rogue_1'] = true; // eslint-disable-line dot-notation

      try {
        purchase(user, {params: {type: 'gear', key: 'shield_rogue_1'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('alreadyHave'));
        done();
      }
    });

    it('returns error when unknown item is requested', (done) => {
      try {
        purchase(user, {params: {type: 'gear', key: 'randomKey'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('contentKeyNotFound', {type: 'gear'}));
        done();
      }
    });

    it('returns error when user does not have permission to buy an item', (done) => {
      try {
        purchase(user, {params: {type: 'gear', key: 'eyewear_mystery_301405'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotAvailable'));
        done();
      }
    });

    it('returns error when user does not have enough gems to buy an item', (done) => {
      try {
        purchase(user, {params: {type: 'gear', key: 'headAccessory_special_wolfEars'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('notEnoughGems'));
        done();
      }
    });


    it('returns error when item is not found', (done) => {
      let params = {key: 'notExisting', type: 'food'};

      try {
        purchase(user, {params});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('contentKeyNotFound', params));
        done();
      }
    });

    it('returns error when user supplies a non-numeric quantity', (done) => {
      let type = 'eggs';
      let key = 'Wolf';

      try {
        purchase(user, {params: {type, key}, quantity: 'jamboree'}, analytics);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('invalidQuantity'));
        done();
      }
    });

    it('returns error when user supplies a negative quantity', (done) => {
      let type = 'eggs';
      let key = 'Wolf';
      user.balance = 10;

      try {
        purchase(user, {params: {type, key}, quantity: -2}, analytics);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('invalidQuantity'));
        done();
      }
    });

    it('returns error when user supplies a decimal quantity', (done) => {
      let type = 'eggs';
      let key = 'Wolf';
      user.balance = 10;

      try {
        purchase(user, {params: {type, key}, quantity: 2.9}, analytics);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('invalidQuantity'));
        done();
      }
    });
  });

  context('successful purchase', () => {
    let userGemAmount = 10;

    before(() => {
      user.balance = userGemAmount;
      user.stats.gp = goldPoints;
      user.purchased.plan.gemsBought = 0;
      user.purchased.plan.customerId = 'customer-id';
      user.pinnedItems.push({type: 'eggs', key: 'Wolf'});
      user.pinnedItems.push({type: 'hatchingPotions', key: 'Base'});
      user.pinnedItems.push({type: 'food', key: SEASONAL_FOOD});
      user.pinnedItems.push({type: 'gear', key: 'headAccessory_special_tigerEars'});
      user.pinnedItems.push({type: 'bundles', key: 'featheredFriends'});
    });

    it('purchases eggs', () => {
      let type = 'eggs';
      let key = 'Wolf';

      purchase(user, {params: {type, key}}, analytics);

      expect(user.items[type][key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
      expect(analytics.track).to.be.calledOnce;
    });

    it('purchases hatchingPotions', () => {
      let type = 'hatchingPotions';
      let key = 'Base';

      purchase(user, {params: {type, key}});

      expect(user.items[type][key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
    });

    it('purchases food', () => {
      let type = 'food';
      let key = SEASONAL_FOOD;

      purchase(user, {params: {type, key}});

      expect(user.items[type][key]).to.equal(1);
      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
    });

    it('purchases gear', () => {
      let type = 'gear';
      let key = 'headAccessory_special_tigerEars';

      purchase(user, {params: {type, key}});

      expect(user.items.gear.owned[key]).to.be.true;
      expect(pinnedGearUtils.removeItemByPath.calledOnce).to.equal(true);
    });

    it('purchases quest bundles', () => {
      let startingBalance = user.balance;
      let clock = sandbox.useFakeTimers(moment('2019-05-20').valueOf());
      let type = 'bundles';
      let key = 'featheredFriends';
      let price = 1.75;
      let questList = [
        'falcon',
        'harpy',
        'owl',
      ];

      purchase(user, {params: {type, key}});

      forEach(questList, (bundledKey) => {
        expect(user.items.quests[bundledKey]).to.equal(1);
      });

      expect(user.balance).to.equal(startingBalance - price);

      expect(pinnedGearUtils.removeItemByPath.notCalled).to.equal(true);
      clock.restore();
    });
  });

  context('bulk purchase', () => {
    let userGemAmount = 10;

    beforeEach(() => {
      user.balance = userGemAmount;
      user.stats.gp = goldPoints;
      user.purchased.plan.gemsBought = 0;
      user.purchased.plan.customerId = 'customer-id';
    });

    it('errors when user does not have enough gems', (done) => {
      user.balance = 1;
      let type = 'eggs';
      let key = 'TigerCub';

      try {
        purchase(user, {
          params: {type, key},
          quantity: 2,
        });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('notEnoughGems'));
        done();
      }
    });

    it('makes bulk purchases of eggs', () => {
      let type = 'eggs';
      let key = 'TigerCub';

      purchase(user, {
        params: {type, key},
        quantity: 2,
      });

      expect(user.items[type][key]).to.equal(2);
    });
  });
});
