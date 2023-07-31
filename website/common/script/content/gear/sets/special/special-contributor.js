import { ownsItem } from '../../gear-helper';
import t from '../../../translation';

const isContributorOfLevel = (tierRequirement, ownedItem) => user => {
  const { contributor } = user;
  const tier = contributor && contributor.level;

  return Number(tier) >= tierRequirement || ownsItem(ownedItem)(user);
};

const armorSpecial1 = {
  text: t('armorSpecial1Text'),
  notes: t('armorSpecial1Notes', { attrs: 6 }),
  con: 6,
  str: 6,
  per: 6,
  int: 6,
  value: 170,
  canOwn: isContributorOfLevel(2, 'armor_special_1'),
};

const headSpecial1 = {
  text: t('headSpecial1Text'),
  notes: t('headSpecial1Notes', { attrs: 6 }),
  con: 6,
  str: 6,
  per: 6,
  int: 6,
  value: 170,
  canOwn: isContributorOfLevel(3, 'head_special_1'),
};

const shieldSpecial1 = {
  text: t('shieldSpecial1Text'),
  notes: t('shieldSpecial1Notes', { attrs: 6 }),
  con: 6,
  str: 6,
  per: 6,
  int: 6,
  value: 170,
  canOwn: isContributorOfLevel(5, 'shield_special_1'),
};

const weaponSpecial1 = {
  text: t('weaponSpecial1Text'),
  notes: t('weaponSpecial1Notes', { attrs: 6 }),
  str: 6,
  per: 6,
  con: 6,
  int: 6,
  value: 170,
  canOwn: isContributorOfLevel(4, 'weapon_special_1'),
};

const weaponSpecialCritical = {
  text: t('weaponSpecialCriticalText'),
  notes: t('weaponSpecialCriticalNotes', { attrs: 40 }),
  str: 40,
  per: 40,
  value: 200,
  canOwn: user => {
    const hasCriticalFlag = user.contributor && user.contributor.critical;
    const alreadyHasItem = ownsItem('weapon_special_critical')(user);

    return hasCriticalFlag || alreadyHasItem;
  },
};

const armorSpecialHeroicTunic = {
  text: t('armorSpecialHeroicTunicText'),
  notes: t('armorSpecialHeroicTunicNotes', { attrs: 7 }),
  con: 7,
  str: 7,
  per: 7,
  int: 7,
  value: 175,
  canOwn: ownsItem('armor_special_heroicTunic'),
};

const backSpecialHeroicAureole = {
  text: t('backSpecialHeroicAureoleText'),
  notes: t('backSpecialHeroicAureoleNotes', { attrs: 7 }),
  con: 7,
  str: 7,
  per: 7,
  int: 7,
  value: 175,
  canOwn: ownsItem('armor_special_heroicAureole'),
};

const headAccessorySpecialHeroicCirclet = {
  text: t('headAccessorySpecialHeroicCircletText'),
  notes: t('headAccessorySpecialHeroicCircletNotes', { attrs: 7 }),
  con: 7,
  str: 7,
  per: 7,
  int: 7,
  value: 175,
  canOwn: ownsItem('headAccessory_special_heroicCirclet'),
};

export {
  armorSpecial1,
  headSpecial1,
  shieldSpecial1,
  weaponSpecial1,
  weaponSpecialCritical,
  armorSpecialHeroicTunic,
  backSpecialHeroicAureole,
  headAccessorySpecialHeroicCirclet,
};
