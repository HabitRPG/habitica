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
    const buyList = await user.get('/user/in-app-rewards');

    expect(_.find(buyList, item => item.text === t('armorWarrior1Text'))).to.exist;

    expect(_.find(buyList, item => item.text === t('armorWarrior2Text'))).to.not.exist;
  });

  describe('localizes the reward items', () => {
    it('from the users locale', async () => {
      await user.updateOne({ 'preferences.language': 'es' });
      const buyList = await user.get('/user/in-app-rewards');

      const armor = _.find(buyList, item => item.key === 'armor_warrior_1');
      expect(armor.text).to.eql(t('armorWarrior1Text', {}, 'es'));
    });

    it('from the passed locale', async () => {
      await user.updateOne({ 'preferences.language': 'es' });
      const buyList = await user.get('/user/in-app-rewards?lang=de');

      const armor = _.find(buyList, item => item.key === 'armor_warrior_1');
      expect(armor.text).to.eql(t('armorWarrior1Text', {}, 'de'));
    });
  });
});
