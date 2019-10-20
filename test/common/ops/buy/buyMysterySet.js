/* eslint-disable camelcase */

import {
  generateUser,
} from '../../../helpers/common.helper';
import buyMysterySet from '../../../../website/common/script/ops/buy/buyMysterySet';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import errorMessage from '../../../../website/common/script/libs/errorMessage';

describe('shared.ops.buyMysterySet', () => {
  let user;
  const analytics = { track () {} };

  beforeEach(() => {
    user = generateUser({
      items: {
        gear: {
          owned: {
            weapon_warrior_0: true,
          },
        },
      },
    });
    sinon.stub(analytics, 'track');
  });

  afterEach(() => {
    analytics.track.restore();
  });

  context('Mystery Sets', () => {
    context('failure conditions', () => {
      it('does not grant mystery sets without Mystic Hourglasses', done => {
        try {
          buyMysterySet(user, { params: { key: '201501' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.eql(i18n.t('notEnoughHourglasses'));
          expect(user.items.gear.owned).to.have.property('weapon_warrior_0', true);
          done();
        }
      });

      it('does not grant mystery set that has already been purchased', done => {
        user.purchased.plan.consecutive.trinkets = 1;
        user.items.gear.owned = {
          weapon_warrior_0: true,
          weapon_mystery_301404: true,
          armor_mystery_301404: true,
          head_mystery_301404: true,
          eyewear_mystery_301404: true,
        };

        try {
          buyMysterySet(user, { params: { key: '301404' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotFound);
          expect(err.message).to.eql(i18n.t('mysterySetNotFound'));
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
          done();
        }
      });

      it('returns error when key is not provided', done => {
        try {
          buyMysterySet(user);
        } catch (err) {
          expect(err).to.be.an.instanceof(BadRequest);
          expect(err.message).to.equal(errorMessage('missingKeyParam'));
          done();
        }
      });
    });

    context('successful purchases', () => {
      it('buys Steampunk Accessories Set', () => {
        user.purchased.plan.consecutive.trinkets = 1;
        buyMysterySet(user, { params: { key: '301404' } }, analytics);

        expect(user.purchased.plan.consecutive.trinkets).to.eql(0);
        expect(user.items.gear.owned).to.have.property('weapon_warrior_0', true);
        expect(user.items.gear.owned).to.have.property('weapon_mystery_301404', true);
        expect(user.items.gear.owned).to.have.property('armor_mystery_301404', true);
        expect(user.items.gear.owned).to.have.property('head_mystery_301404', true);
        expect(user.items.gear.owned).to.have.property('eyewear_mystery_301404', true);
        expect(analytics.track).to.be.called;
      });
    });
  });
});
