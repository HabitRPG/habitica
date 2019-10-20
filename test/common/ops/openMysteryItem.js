import openMysteryItem from '../../../website/common/script/ops/openMysteryItem';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  BadRequest,
} from '../../../website/common/script/libs/errors';
import content from '../../../website/common/script/content/index';
import i18n from '../../../website/common/script/i18n';

describe('shared.ops.openMysteryItem', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('returns error when item key is empty', done => {
    try {
      openMysteryItem(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('mysteryItemIsEmpty'));
      done();
    }
  });

  it('opens mystery item', () => {
    const mysteryItemKey = 'eyewear_special_summerRogue';

    user.purchased.plan.mysteryItems = [mysteryItemKey];
    user.notifications.push({ type: 'NEW_MYSTERY_ITEMS', data: { items: [mysteryItemKey] } });
    expect(user.notifications.length).to.equal(1);

    const [data, message] = openMysteryItem(user);

    expect(user.items.gear.owned[mysteryItemKey]).to.be.true;
    expect(message).to.equal(i18n.t('mysteryItemOpened'));
    const item = _.cloneDeep(content.gear.flat[mysteryItemKey]);
    item.text = content.gear.flat[mysteryItemKey].text();
    expect(data).to.eql(item);
    expect(user.notifications.length).to.equal(0);
  });
});
