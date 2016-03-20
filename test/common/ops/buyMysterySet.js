/* eslint-disable camelcase */

import sinon from 'sinon'; // eslint-disable-line no-shadow
import {
  generateUser,
} from '../../helpers/common.helper';
import buyMysterySet from '../../../common/script/ops/buyMysterySet';
import {
  NotAuthorized,
  NotFound,
} from '../../../common/script/libs/errors';
import i18n from '../../../common/script/i18n';

describe('shared.ops.buyMysterySet', () => {
  let user;

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
  });

  context('Mystery Sets', () => {
    context('failure conditions', () => {
      it('does not grant mystery sets without Mystic Hourglasses', () => {
        try {
          expect(buyMysterySet(user, {params: {key: '201501'}})).to.throw(NotAuthorized);
        } catch (err) {
          expect(err.message).to.eql(i18n.t('notEnoughHourglasses'));
          expect(user.items.gear.owned).to.have.property('weapon_warrior_0', true);
        }
      });

      it('does not grant mystery set that has already been purchased', () => {
        user.purchased.plan.consecutive.trinkets = 1;
        user.items.gear.owned = {
          weapon_warrior_0: true,
          weapon_mystery_301404: true,
          armor_mystery_301404: true,
          head_mystery_301404: true,
          eyewear_mystery_301404: true,
        };

        try {
          expect(buyMysterySet(user, {params: {key: '301404'}})).to.throw(NotFound);
        } catch (err) {
          expect(err.message).to.eql(i18n.t('mysterySetNotFound'));
          expect(user.purchased.plan.consecutive.trinkets).to.eql(1);
        }
      });
    });

    context('successful purchases', () => {
      it('buys Steampunk Accessories Set', () => {
        user.purchased.plan.consecutive.trinkets = 1;
        buyMysterySet(user, {params: {key: '301404'}});

        expect(user.purchased.plan.consecutive.trinkets).to.eql(0);
        expect(user.items.gear.owned).to.have.property('weapon_warrior_0', true);
        expect(user.items.gear.owned).to.have.property('weapon_mystery_301404', true);
        expect(user.items.gear.owned).to.have.property('armor_mystery_301404', true);
        expect(user.items.gear.owned).to.have.property('head_mystery_301404', true);
        expect(user.items.gear.owned).to.have.property('eyewear_mystery_301404', true);
      });
    });
  });
});
