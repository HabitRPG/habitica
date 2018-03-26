import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /user/in-app-rewards', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns the reward items available for purchase', async () => {
    let buyList = await user.get('/user/in-app-rewards');

    expect(_.find(buyList, item => {
      return item.text === t('armorWarrior1Text');
    })).to.exist;

    expect(_.find(buyList, item => {
      return item.text === t('armorWarrior2Text');
    })).to.not.exist;
  });
});
