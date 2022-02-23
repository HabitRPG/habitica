/* eslint-disable camelcase */
import { defaultsDeep } from 'lodash';
import {
  generateUser,
} from '../../../helpers/common.helper';
import buy from '../../../../website/common/script/ops/buy/buy';
import {
  BadRequest,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import content from '../../../../website/common/script/content/index';
import errorMessage from '../../../../website/common/script/libs/errorMessage';

describe('shared.ops.buy', () => {
  let user;
  const analytics = { track () {} };

  beforeEach(() => {
    user = generateUser({
      stats: { gp: 200 },
    });

    defaultsDeep(user, {
      items: {
        gear: {
          owned: {
            weapon_warrior_0: true,
          },
          equipped: {
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

  it('returns error when key is not provided', async () => {
    try {
      await buy(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(errorMessage('missingKeyParam'));
    }
  });

  it('recovers 15 hp', async () => {
    user.stats.hp = 30;
    await buy(user, { params: { key: 'potion' } }, analytics);
    expect(user.stats.hp).to.eql(45);

    expect(analytics.track).to.be.calledOnce;
  });

  it('adds equipment to inventory', async () => {
    user.stats.gp = 31;

    await buy(user, { params: { key: 'armor_warrior_1' } });

    expect(user.items.gear.owned).to.eql({
      weapon_warrior_0: true,
      armor_warrior_1: true,
      eyewear_special_blackTopFrame: true,
      eyewear_special_blueTopFrame: true,
      eyewear_special_greenTopFrame: true,
      eyewear_special_pinkTopFrame: true,
      eyewear_special_redTopFrame: true,
      eyewear_special_whiteTopFrame: true,
      eyewear_special_yellowTopFrame: true,
      headAccessory_special_blackHeadband: true,
      headAccessory_special_blueHeadband: true,
      headAccessory_special_greenHeadband: true,
      headAccessory_special_pinkHeadband: true,
      headAccessory_special_redHeadband: true,
      headAccessory_special_whiteHeadband: true,
      headAccessory_special_yellowHeadband: true,
      eyewear_special_blackHalfMoon: true,
      eyewear_special_blueHalfMoon: true,
      eyewear_special_greenHalfMoon: true,
      eyewear_special_pinkHalfMoon: true,
      eyewear_special_redHalfMoon: true,
      eyewear_special_whiteHalfMoon: true,
      eyewear_special_yellowHalfMoon: true,
    });
  });

  it('buys Steampunk Accessories Set', async () => {
    user.purchased.plan.consecutive.trinkets = 1;

    await buy(user, {
      params: {
        key: '301404',
      },
      type: 'mystery',
    });

    expect(user.purchased.plan.consecutive.trinkets).to.eql(0);
    expect(user.items.gear.owned).to.have.property('weapon_warrior_0', true);
    expect(user.items.gear.owned).to.have.property('weapon_mystery_301404', true);
    expect(user.items.gear.owned).to.have.property('armor_mystery_301404', true);
    expect(user.items.gear.owned).to.have.property('head_mystery_301404', true);
    expect(user.items.gear.owned).to.have.property('eyewear_mystery_301404', true);
  });

  it('buys a Quest scroll', async () => {
    user.stats.gp = 205;

    await buy(user, {
      params: {
        key: 'dilatoryDistress1',
      },
      type: 'quest',
    });

    expect(user.items.quests).to.eql({ dilatoryDistress1: 1 });
    expect(user.stats.gp).to.equal(5);
  });

  it('buys a special item', async () => {
    user.stats.gp = 11;
    const item = content.special.thankyou;

    const [data, message] = await buy(user, {
      params: {
        key: 'thankyou',
      },
      type: 'special',
    });

    expect(user.stats.gp).to.equal(1);
    expect(user.items.special.thankyou).to.equal(1);
    expect(data).to.eql({
      items: user.items,
      stats: user.stats,
    });
    expect(message).to.equal(i18n.t('messageBought', {
      itemText: item.text(),
    }));
  });

  it('allows for bulk purchases', async () => {
    user.stats.hp = 30;
    await buy(user, { params: { key: 'potion' }, quantity: 2 });
    expect(user.stats.hp).to.eql(50);
  });

  it('errors if user supplies a non-numeric quantity', async () => {
    try {
      await buy(user, {
        params: {
          key: 'dilatoryDistress1',
        },
        type: 'quest',
        quantity: 'bogle',
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(errorMessage('invalidQuantity'));
    }
  });

  it('errors if user supplies a negative quantity', async () => {
    try {
      await buy(user, {
        params: {
          key: 'dilatoryDistress1',
        },
        type: 'quest',
        quantity: -3,
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(errorMessage('invalidQuantity'));
    }
  });

  it('errors if user supplies a decimal quantity', async () => {
    try {
      await buy(user, {
        params: {
          key: 'dilatoryDistress1',
        },
        type: 'quest',
        quantity: 1.83,
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(errorMessage('invalidQuantity'));
    }
  });
});
