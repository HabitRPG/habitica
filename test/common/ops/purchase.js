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

describe('shared.ops.purchase', () => {
  const SEASONAL_FOOD = 'Candy_Base';
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
    });

    it('purchases gems', () => {
      let [, message] = purchase(user, {params: {type: 'gems', key: 'gem'}});

      expect(message).to.equal(i18n.t('plusOneGem'));
      expect(user.balance).to.equal(userGemAmount + 0.25);
      expect(user.purchased.plan.gemsBought).to.equal(1);
      expect(user.stats.gp).to.equal(goldPoints - planGemLimits.convRate);
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
  });
});
