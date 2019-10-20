import shared from '../../../website/common';
import {
  generateUser,
} from '../../helpers/common.helper';
import i18n from '../../../website/common/script/i18n';

describe('updateStore', () => {
  context('returns a list of gear items available for purchase', () => {
    const user = generateUser();
    user.items.gear.owned.armor_armoire_lunarArmor = false; // eslint-disable-line camelcase
    user.contributor.level = 2;
    user.purchased.plan.mysteryItems = ['armor_mystery_201402'];
    user.items.gear.owned.armor_mystery_201402 = false; // eslint-disable-line camelcase

    const list = shared.updateStore(user);

    it('contains the first item not purchased for each gear type', () => {
      expect(_.find(list, item => item.text() === i18n.t('armorWarrior1Text'))).to.exist;

      expect(_.find(list, item => item.text() === i18n.t('armorWarrior2Text'))).to.not.exist;
    });

    it('contains mystery items the user can own', () => {
      expect(_.find(list, item => item.text() === i18n.t('armorMystery201402Text'))).to.exist;

      expect(_.find(list, item => item.text() === i18n.t('armorMystery201403Text'))).to.not.exist;
    });

    it('contains special items the user can own', () => {
      expect(_.find(list, item => item.text() === i18n.t('armorSpecial1Text'))).to.exist;

      expect(_.find(list, item => item.text() === i18n.t('headSpecial1Text'))).to.not.exist;
    });

    it('contains armoire items the user can own', () => {
      expect(_.find(list, item => item.text() === i18n.t('armorArmoireLunarArmorText'))).to.exist;

      expect(_.find(list, item => item.text() === i18n.t('armorArmoireGladiatorArmorText'))).to.not.exist;
    });
  });
});
