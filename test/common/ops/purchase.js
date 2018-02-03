import purchase from '../../../website/common/script/ops/purchase';
import planGemLimits from '../../../website/common/script/libs/planGemLimits';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import forEach from 'lodash/forEach';
import moment from 'moment';

describe('shared.ops.purchase', () => {
  const SEASONAL_FOOD = 'Meat';
  let user;
  let goldPoints = 40;
  let gemsBought = 40;

  before(() => {
    user = generateUser({'stats.class': 'rogue'});
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

    it('returns an error when key is not provided', (done) => {
      try {
        purchase(user, {params: {type: 'gems'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('keyRequired'));
        done();
      }
    });

    it('prevents unsubscribed user from buying gems', (done) => {
      try {
        purchase(user, {params: {type: 'gems', key: 'gem'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('mustSubscribeToPurchaseGems'));
        done();
      }
    });

    it('prevents user with not enough gold from buying gems', (done) => {
      user.purchased.plan.customerId = 'customer-id';

      try {
        purchase(user, {params: {type: 'gems', key: 'gem'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
        done();
      }
    });

    it('prevents user that have reached the conversion cap from buying gems', (done) => {
      user.stats.gp = goldPoints;
      user.purchased.plan.gemsBought = gemsBought;

      try {
        purchase(user, {params: {type: 'gems', key: 'gem'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('reachedGoldToGemCap', {convCap: planGemLimits.convCap}));
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
  });

  context('successful purchase', () => {
    let userGemAmount = 10;

    before(() => {
      user.balance = userGemAmount;
      user.stats.gp = goldPoints;
      user.purchased.plan.gemsBought = 0;
      user.purchased.plan.customerId = 'customer-id';
    });

    it('purchases gems', () => {
      let [, message] = purchase(user, {params: {type: 'gems', key: 'gem'}});

      expect(message).to.equal(i18n.t('plusOneGem'));
      expect(user.balance).to.equal(userGemAmount + 0.25);
      expect(user.purchased.plan.gemsBought).to.equal(1);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate);
    });

    it('purchases gems with a different language than the default', () => {
      let [, message] = purchase(user, {params: {type: 'gems', key: 'gem'}, language: 'de'});

      expect(message).to.equal(i18n.t('plusOneGem', 'de'));
      expect(user.balance).to.equal(userGemAmount + 0.5);
      expect(user.purchased.plan.gemsBought).to.equal(2);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate * 2);
    });

    it('purchases eggs', () => {
      let type = 'eggs';
      let key = 'Wolf';

      purchase(user, {params: {type, key}});

      expect(user.items[type][key]).to.equal(1);
    });

    it('purchases hatchingPotions', () => {
      let type = 'hatchingPotions';
      let key = 'Base';

      purchase(user, {params: {type, key}});

      expect(user.items[type][key]).to.equal(1);
    });

    it('purchases food', () => {
      let type = 'food';
      let key = SEASONAL_FOOD;

      purchase(user, {params: {type, key}});

      expect(user.items[type][key]).to.equal(1);
    });

    it('purchases quests', () => {
      let type = 'quests';
      let key = 'gryphon';

      purchase(user, {params: {type, key}});

      expect(user.items[type][key]).to.equal(1);
    });

    it('purchases gear', () => {
      let type = 'gear';
      let key = 'headAccessory_special_tigerEars';

      purchase(user, {params: {type, key}});

      expect(user.items.gear.owned[key]).to.be.true;
    });

    it('purchases quest bundles', () => {
      let startingBalance = user.balance;
      let clock = sandbox.useFakeTimers(moment('2017-05-20').valueOf());
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

    it('makes bulk purchases of gems', () => {
      let [, message] = purchase(user, {
        params: {type: 'gems', key: 'gem'},
        quantity: 2,
      });

      expect(message).to.equal(i18n.t('plusOneGem'));
      expect(user.balance).to.equal(userGemAmount + 0.50);
      expect(user.purchased.plan.gemsBought).to.equal(2);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate * 2);
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
