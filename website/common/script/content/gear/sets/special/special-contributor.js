import { ownsItem } from '../../gear-helper';
import t from '../../../translation';

let isContributorOfLevel = (tierRequirement, ownedItem) => {
  return (user) => {
    let contributor = user.contributor;
    let tier = contributor && contributor.level;

    return Number(tier) >= tierRequirement || ownsItem(ownedItem)(user);
  };
};

let armorSpecial1 = {
  text: t('armorSpecial1Text'),
  notes: t('armorSpecial1Notes', { attrs: 6 }),
  con: 6,
  str: 6,
  per: 6,
  int: 6,
  value: 170,
  canOwn: isContributorOfLevel(2, 'armor_special_1'),
};

let headSpecial1 = {
  text: t('headSpecial1Text'),
  notes: t('headSpecial1Notes', { attrs: 6 }),
  con: 6,
  str: 6,
  per: 6,
  int: 6,
  value: 170,
  canOwn: isContributorOfLevel(3, 'head_special_1'),
};

let shieldSpecial1 = {
  text: t('shieldSpecial1Text'),
  notes: t('shieldSpecial1Notes', { attrs: 6 }),
  con: 6,
  str: 6,
  per: 6,
  int: 6,
  value: 170,
  canOwn: isContributorOfLevel(5, 'shield_special_1'),
};

let weaponSpecial1 = {
  text: t('weaponSpecial1Text'),
  notes: t('weaponSpecial1Notes', { attrs: 6 }),
  str: 6,
  per: 6,
  con: 6,
  int: 6,
  value: 170,
  canOwn: isContributorOfLevel(4, 'weapon_special_1'),
};

let weaponSpecialCritical = {
  text: t('weaponSpecialCriticalText'),
  notes: t('weaponSpecialCriticalNotes', { attrs: 40 }),
  str: 40,
  per: 40,
  value: 200,
  canOwn: (user) => {
    let hasCriticalFlag = user.contributor && user.contributor.critical;
    let alreadyHasItem = ownsItem('weapon_special_critical')(user);

    return hasCriticalFlag || alreadyHasItem;
  },
};

let contributorSet = {
  armorSpecial1,
  headSpecial1,
  shieldSpecial1,
  weaponSpecial1,
  weaponSpecialCritical,
};

module.exports = contributorSet;
