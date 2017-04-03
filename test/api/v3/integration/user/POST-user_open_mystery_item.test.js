import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import content from '../../../../../website/common/script/content/index';

describe('POST /user/open-mystery-item', () => {
  let user;
  let mysteryItemKey = 'eyewear_special_summerRogue';
  let mysteryItemIndex = content.gear.flat[mysteryItemKey].index;
  let mysteryItemType = content.gear.flat[mysteryItemKey].type;

  beforeEach(async () => {
    user = await generateUser({
      'purchased.plan.mysteryItems': [mysteryItemKey],
    });
  });

  // More tests in common code unit tests

  it('opens a mystery item', async () => {
    let response = await user.post('/user/open-mystery-item');
    await user.sync();

    expect(user.items.gear.owned[mysteryItemKey]).to.be.true;
    expect(response.message).to.equal(t('mysteryItemOpened'));
    expect(response.data.key).to.eql(mysteryItemKey);
    expect(response.data.index).to.eql(mysteryItemIndex);
    expect(response.data.type).to.eql(mysteryItemType);
  });
});
