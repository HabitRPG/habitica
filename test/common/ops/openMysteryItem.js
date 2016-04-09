import openMysteryItem from '../../../common/script/ops/openMysteryItem';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  BadRequest,
} from '../../../common/script/libs/errors';
import i18n from '../../../common/script/i18n';

describe('shared.ops.openMysteryItem', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('returns error when item key is empty', (done) => {
    try {
      openMysteryItem(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('mysteryItemIsEmpty'));
      done();
    }
  });

  it('opens mystery item', () => {
    let mysteryItemKey = 'eyewear_special_summerRogue';

    user.purchased.plan.mysteryItems = [mysteryItemKey];

    let response = openMysteryItem(user);

    expect(user.items.gear.owned[mysteryItemKey]).to.be.true;
    expect(response.message).to.equal(i18n.t('mysteryItemOpened'));
    expect(response.data).to.equal(user.items.gear.owned);
  });
});
