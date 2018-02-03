/* eslint-disable camelcase */
import {
  generateUser,
} from '../../../helpers/common.helper';
import buy from '../../../../website/common/script/ops/buy';
import {
  BadRequest,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import content from '../../../../website/common/script/content/index';

describe('shared.ops.buy', () => {
  let user;

  beforeEach(() => {
    user = generateUser({
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
      stats: { gp: 200 },
    });
  });

  it('returns error when key is not provided', (done) => {
    try {
      buy(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('missingKeyParam'));
      done();
    }
  });

  it('recovers 15 hp', () => {
    user.stats.hp = 30;
    buy(user, {params: {key: 'potion'}});
    expect(user.stats.hp).to.eql(45);
  });

  it('adds equipment to inventory', () => {
    user.stats.gp = 31;

    buy(user, {params: {key: 'armor_warrior_1'}});

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
    });
  });

  it('buys Steampunk Accessories Set', () => {
    user.purchased.plan.consecutive.trinkets = 1;

    buy(user, {
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

  it('buys a Quest scroll', () => {
    user.stats.gp = 205;

    buy(user, {
      params: {
        key: 'dilatoryDistress1',
      },
      type: 'quest',
    });

    expect(user.items.quests).to.eql({dilatoryDistress1: 1});
    expect(user.stats.gp).to.equal(5);
  });

  it('buys a special item', () => {
    user.stats.gp = 11;
    let item = content.special.thankyou;

    let [data, message] = buy(user, {
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

  it('allows for bulk purchases', () => {
    user.stats.hp = 30;
    buy(user, {params: {key: 'potion'}, quantity: 2});
    expect(user.stats.hp).to.eql(50);
  });
});
