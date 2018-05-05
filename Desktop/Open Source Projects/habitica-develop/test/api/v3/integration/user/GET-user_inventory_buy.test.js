import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /user/inventory/buy', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  // More tests in common code unit tests

  it('returns the gear items available for purchase', async () => {
    let buyList = await user.get('/user/inventory/buy');

    expect(_.find(buyList, item => {
      return item.text === t('armorWarrior1Text');
    })).to.exist;

    expect(_.find(buyList, item => {
      return item.text === t('armorWarrior2Text');
    })).to.not.exist;
  });
});
