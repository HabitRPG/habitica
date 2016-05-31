import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/open-mystery-item', () => {
  let user;
  let mysteryItemKey = 'eyewear_special_summerRogue';

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
    expect(response.data).to.deep.equal(user.items.gear.owned);
  });
});
