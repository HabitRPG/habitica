import content from '../content/index';
import i18n from '../i18n';

module.exports = function handleTwoHanded (user, item, type = 'equipped', req = {}) {
  let currentShield = content.gear.flat[user.items.gear[type].shield];
  let currentWeapon = content.gear.flat[user.items.gear[type].weapon];

  let message;

  if (item.type === 'shield' && (currentWeapon ? currentWeapon.twoHanded : false)) {
    user.items.gear[type].weapon = 'weapon_base_0';
    message = i18n.t('messageTwoHandedUnequip', {
      twoHandedText: currentWeapon.text(req.language), offHandedText: item.text(req.language),
    }, req.language);
  } else if (item.twoHanded && (currentShield && user.items.gear[type].shield !== 'shield_base_0')) {
    user.items.gear[type].shield = 'shield_base_0';
    message = i18n.t('messageTwoHandedEquip', {
      twoHandedText: item.text(req.language), offHandedText: currentShield.text(req.language),
    }, req.language);
  }

  return message;
};
