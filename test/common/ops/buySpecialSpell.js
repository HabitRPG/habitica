import buySpecialSpell from '../../../common/script/ops/buySpecialSpell';
import {
  BadRequest,
  NotFound,
  NotAuthorized,
} from '../../../common/script/libs/errors';
import i18n from '../../../common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import content from '../../../common/script/content/index';

describe('shared.ops.buySpecialSpell', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('throws an error if params.key is missing', () => {
    try {
      expect(buySpecialSpell(user)).to.throw(BadRequest);
    } catch (err) {
      expect(err.message).to.equal(i18n.t('missingKeyParam'));
    }
  });

  it('throws an error if the spell doesn\'t exists', () => {
    try {
      expect(buySpecialSpell(user, {
        params: {
          key: 'notExisting',
        },
      })).to.throw(NotFound);
    } catch (err) {
      expect(err.message).to.equal(i18n.t('spellNotFound', {spellId: 'notExisting'}));
    }
  });

  it('throws an error if the user doesn\'t have enough gold', () => {
    user.stats.gp = 1;
    try {
      expect(buySpecialSpell(user, {
        params: {
          key: 'thankyou',
        },
      })).to.throw(NotAuthorized);
    } catch (err) {
      expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
    }
  });

  it('buys an item', () => {
    user.stats.gp = 11;
    let item = content.special.thankyou;

    let res = buySpecialSpell(user, {
      params: {
        key: 'thankyou',
      },
    });

    expect(user.stats.gp).to.equal(1);
    expect(user.items.special.thankyou).to.equal(1);
    expect(res.data).to.eql({
      items: user.items,
      stats: user.stats,
    });
    expect(res.message).to.equal(i18n.t('messageBought', {
      itemText: item.text(),
    }));
  });
});
