import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import content from '../../../../../website/common/script/content/index';

describe('POST /user/open-mystery-item', () => {
  let user;
  const mysteryItemKey = 'eyewear_special_summerRogue';
  const mysteryItemIndex = content.gear.flat[mysteryItemKey].index;
  const mysteryItemType = content.gear.flat[mysteryItemKey].type;
  const mysteryItemText = content.gear.flat[mysteryItemKey].text();

  beforeEach(async () => {
    user = await generateUser({
      'purchased.plan.mysteryItems': [mysteryItemKey],
      notifications: [
        { type: 'NEW_MYSTERY_ITEMS', data: { items: [mysteryItemKey] } },
      ],
    });
  });

  // More tests in common code unit tests

  it('opens a mystery item', async () => {
    expect(user.notifications.length).to.equal(1);
    const response = await user.post('/user/open-mystery-item');
    await user.sync();

    expect(user.notifications.length).to.equal(0);
    expect(user.items.gear.owned[mysteryItemKey]).to.be.true;
    expect(response.message).to.equal(t('mysteryItemOpened'));
    expect(response.data.key).to.eql(mysteryItemKey);
    expect(response.data.index).to.eql(mysteryItemIndex);
    expect(response.data.type).to.eql(mysteryItemType);
    expect(response.data.text).to.eql(mysteryItemText);
  });
});
