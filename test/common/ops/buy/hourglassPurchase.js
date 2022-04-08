import hourglassPurchase from '../../../../website/common/script/ops/buy/hourglassPurchase';
import {
  BadRequest,
  NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import content from '../../../../website/common/script/content/index';
import {
  generateUser,
} from '../../../helpers/common.helper';
import errorMessage from '../../../../website/common/script/libs/errorMessage';
import { BuyHourglassMountOperation } from '../../../../website/common/script/ops/buy/buyMount';

describe('common.ops.hourglassPurchase', () => {
  let user;
  const analytics = { track () {} };

  async function buyMount (_user, _req, _analytics) {
    const buyOp = new BuyHourglassMountOperation(_user, _req, _analytics);

    return buyOp.purchase();
  }

  beforeEach(() => {
    user = generateUser();
    sinon.stub(analytics, 'track');
  });

  afterEach(() => {
    analytics.track.restore();
  });

  context('failure conditions', () => {
    it('return error when key is not provided', async () => {
      try {
        await hourglassPurchase(user, { params: {} });
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.eql(errorMessage('missingKeyParam'));
      }
    });

    it('returns error when type is not provided', async () => {
      try {
        await hourglassPurchase(user, { params: { key: 'Base' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.eql(errorMessage('missingTypeParam'));
      }
    });

    it('returns error when inccorect type is provided', async () => {
      try {
        await hourglassPurchase(user, { params: { type: 'notAType', key: 'MantisShrimp-Base' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('typeNotAllowedHourglass', { allowedTypes: _.keys(content.timeTravelStable).toString() }));
      }
    });

    it('does not grant to pets without Mystic Hourglasses', async () => {
      try {
        await hourglassPurchase(user, { params: { type: 'pets', key: 'MantisShrimp-Base' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('notEnoughHourglasses'));
      }
    });

    it('does not grant to mounts without Mystic Hourglasses', async () => {
      try {
        await buyMount(user, { params: { key: 'MantisShrimp-Base' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('notEnoughHourglasses'));
      }
    });

    it('does not grant pet that is not part of the Time Travel Stable', async () => {
      user.purchased.plan.consecutive.trinkets = 1;

      try {
        await hourglassPurchase(user, { params: { type: 'pets', key: 'Wolf-Veteran' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('notAllowedHourglass'));
      }
    });

    it('does not grant mount that is not part of the Time Travel Stable', async () => {
      user.purchased.plan.consecutive.trinkets = 1;

      try {
        await buyMount(user, { params: { key: 'Orca-Base' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('notAllowedHourglass'));
      }
    });

    it('does not grant pet that has already been purchased', async () => {
      user.purchased.plan.consecutive.trinkets = 1;
      user.items.pets = {
        'MantisShrimp-Base': true,
      };

      try {
        await hourglassPurchase(user, { params: { type: 'pets', key: 'MantisShrimp-Base' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('petsAlreadyOwned'));
      }
    });

    it('does not grant mount that has already been purchased', async () => {
      user.purchased.plan.consecutive.trinkets = 1;
      user.items.mounts = {
        'MantisShrimp-Base': true,
      };

      try {
        await buyMount(user, { params: { key: 'MantisShrimp-Base' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.eql(i18n.t('mountsAlreadyOwned'));
      }
    });
  });

  context('successful purchases', () => {
    it('buys a pet', async () => {
      user.purchased.plan.consecutive.trinkets = 2;

      const [, message] = await hourglassPurchase(user, { params: { type: 'pets', key: 'MantisShrimp-Base' } }, analytics);

      expect(message).to.eql(i18n.t('hourglassPurchase'));
      expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
      expect(user.items.pets).to.eql({ 'MantisShrimp-Base': 5 });
      expect(analytics.track).to.be.calledOnce;
    });

    it('buys a mount', async () => {
      user.purchased.plan.consecutive.trinkets = 2;

      const [, message] = await buyMount(user, { params: { key: 'MantisShrimp-Base' } });
      expect(message).to.eql(i18n.t('hourglassPurchase'));
      expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
      expect(user.items.mounts).to.eql({ 'MantisShrimp-Base': true });
    });
  });
});
