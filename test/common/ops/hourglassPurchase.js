import hourglassPurchase from '../../../website/common/script/ops/hourglassPurchase';
import {
  BadRequest,
  NotAuthorized,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';
import content from '../../../website/common/script/content/index';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('user.ops.hourglassPurchase', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  context('failure conditions', () => {
    it('return error when key is not provided', (done) => {
      try {
        hourglassPurchase(user, {params: {}});
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.eql(i18n.t('missingKeyParam'));
        done();
      }
    });

    it('returns error when type is not provided', (done) => {
      try {
        hourglassPurchase(user, {params: {key: 'Base'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.eql(i18n.t('missingTypeParam'));
        done();
      }
    });

    it('returns error when inccorect type is provided', (done) => {
      try {
        hourglassPurchase(user, {params: {type: 'notAType', key: 'MantisShrimp-Base'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('typeNotAllowedHourglass', {allowedTypes: _.keys(content.timeTravelStable).toString()}));
        done();
      }
    });

    it('does not grant to pets without Mystic Hourglasses', (done) => {
      try {
        hourglassPurchase(user, {params: {type: 'pets', key: 'MantisShrimp-Base'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('notEnoughHourglasses'));
        done();
      }
    });

    it('does not grant to mounts without Mystic Hourglasses', (done) => {
      try {
        hourglassPurchase(user, {params: {type: 'mounts', key: 'MantisShrimp-Base'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('notEnoughHourglasses'));
        done();
      }
    });

    it('does not grant pet that is not part of the Time Travel Stable', (done) => {
      user.purchased.plan.consecutive.trinkets = 1;

      try {
        hourglassPurchase(user, {params: {type: 'pets', key: 'Wolf-Veteran'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('notAllowedHourglass'));
        done();
      }
    });

    it('does not grant mount that is not part of the Time Travel Stable', (done) => {
      user.purchased.plan.consecutive.trinkets = 1;

      try {
        hourglassPurchase(user, {params: {type: 'mounts', key: 'Orca-Base'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('notAllowedHourglass'));
        done();
      }
    });

    it('does not grant pet that has already been purchased', (done) => {
      user.purchased.plan.consecutive.trinkets = 1;
      user.items.pets = {
        'MantisShrimp-Base': true,
      };

      try {
        hourglassPurchase(user, {params: {type: 'pets', key: 'MantisShrimp-Base'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('petsAlreadyOwned'));
        done();
      }
    });

    it('does not grant mount that has already been purchased', (done) => {
      user.purchased.plan.consecutive.trinkets = 1;
      user.items.mounts = {
        'MantisShrimp-Base': true,
      };

      try {
        hourglassPurchase(user, {params: {type: 'mounts', key: 'MantisShrimp-Base'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('mountsAlreadyOwned'));
        done();
      }
    });
  });

  context('successful purchases', () => {
    it('buys a pet', () => {
      user.purchased.plan.consecutive.trinkets = 2;

      let [, message] = hourglassPurchase(user, {params: {type: 'pets', key: 'MantisShrimp-Base'}});

      expect(message).to.eql(i18n.t('hourglassPurchase'));
      expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
      expect(user.items.pets).to.eql({'MantisShrimp-Base': 5});
    });

    it('buys a mount', () => {
      user.purchased.plan.consecutive.trinkets = 2;

      let [, message] = hourglassPurchase(user, {params: {type: 'mounts', key: 'MantisShrimp-Base'}});
      expect(message).to.eql(i18n.t('hourglassPurchase'));
      expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
      expect(user.items.mounts).to.eql({'MantisShrimp-Base': true});
    });
  });
});
