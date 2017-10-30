import buySpecialSpell from '../../../../website/common/script/ops/buySpecialSpell';
import {
  BadRequest,
  NotFound,
  NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import {
  generateUser,
} from '../../../helpers/common.helper';
import content from '../../../../website/common/script/content/index';

describe('shared.ops.buySpecialSpell', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('throws an error if params.key is missing', (done) => {
    try {
      buySpecialSpell(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('missingKeyParam'));
      done();
    }
  });

  it('throws an error if the spell doesn\'t exists', (done) => {
    try {
      buySpecialSpell(user, {
        params: {
          key: 'notExisting',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotFound);
      expect(err.message).to.equal(i18n.t('spellNotFound', {spellId: 'notExisting'}));
      done();
    }
  });

  it('throws an error if the user doesn\'t have enough gold', (done) => {
    user.stats.gp = 1;
    try {
      buySpecialSpell(user, {
        params: {
          key: 'thankyou',
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('messageNotEnoughGold'));
      done();
    }
  });

  it('buys an item', () => {
    user.stats.gp = 11;
    let item = content.special.thankyou;

    let [data, message] = buySpecialSpell(user, {
      params: {
        key: 'thankyou',
      },
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
});
