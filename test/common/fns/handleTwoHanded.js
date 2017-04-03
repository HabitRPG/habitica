import handleTwoHanded from '../../../website/common/script/fns/handleTwoHanded';
import content from '../../../website/common/script/content/index';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.fns.handleTwoHanded', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('uses "messageTwoHandedUnequip" message if item is a shield and current weapon is two handed (and sets the user\'s weapon to the base one)', () => {
    let item = content.gear.tree.shield.warrior['2'];
    let currentWeapon = content.gear.tree.weapon.armoire.rancherLasso;
    user.items.gear.equipped.weapon = 'weapon_armoire_rancherLasso';

    let message = handleTwoHanded(user, item);
    expect(message).to.equal(i18n.t('messageTwoHandedUnequip', {
      twoHandedText: currentWeapon.text(), offHandedText: item.text(),
    }));
    expect(user.items.gear.equipped.weapon).to.equal('weapon_base_0');
  });

  it('uses "messageTwoHandedEquip" message if item is two handed and currentShield exists but is not "shield_base_0" (and sets the user\'s shield to the base one)', () => {
    let item = content.gear.tree.weapon.armoire.rancherLasso;
    let currentShield = content.gear.tree.shield.armoire.gladiatorShield;
    user.items.gear.equipped.shield = 'shield_armoire_gladiatorShield';

    let message = handleTwoHanded(user, item);
    expect(message).to.equal(i18n.t('messageTwoHandedEquip', {
      twoHandedText: item.text(), offHandedText: currentShield.text(),
    }));
    expect(user.items.gear.equipped.shield).to.equal('shield_base_0');
  });
});
