import { ownsItem } from '../../gear-helper';
import t from '../../../translation';

const isBackerOfLevel = (tierRequirement, ownedItem) => user => {
  const { backer } = user;
  const tier = Number(backer && backer.tier);

  return tier >= tierRequirement || ownsItem(ownedItem)(user);
};

const armorSpecial0 = {
  text: t('armorSpecial0Text'),
  notes: t('armorSpecial0Notes', { con: 20 }),
  con: 20,
  value: 150,
  canOwn: isBackerOfLevel(45, 'armor_special_0'),
};

const armorSpecial2 = {
  text: t('armorSpecial2Text'),
  notes: t('armorSpecial2Notes', { attrs: 25 }),
  int: 25,
  con: 25,
  value: 200,
  canOwn: isBackerOfLevel(300, 'armor_special_2'),
};

const headSpecial0 = {
  text: t('headSpecial0Text'),
  notes: t('headSpecial0Notes', { int: 20 }),
  int: 20,
  value: 150,
  canOwn: isBackerOfLevel(45, 'head_special_0'),
};

const headSpecial2 = {
  text: t('headSpecial2Text'),
  notes: t('headSpecial2Notes', { attrs: 25 }),
  int: 25,
  str: 25,
  value: 200,
  canOwn: isBackerOfLevel(300, 'head_special_2'),
};

const shieldSpecial0 = {
  text: t('shieldSpecial0Text'),
  notes: t('shieldSpecial0Notes', { per: 20 }),
  per: 20,
  value: 150,
  canOwn: isBackerOfLevel(45, 'shield_special_0'),
};

const weaponSpecial0 = {
  text: t('weaponSpecial0Text'),
  notes: t('weaponSpecial0Notes', { str: 20 }),
  str: 20,
  value: 150,
  canOwn: isBackerOfLevel(70, 'weapon_special_0'),
};

const weaponSpecial2 = {
  text: t('weaponSpecial2Text'),
  notes: t('weaponSpecial2Notes', { attrs: 25 }),
  str: 25,
  per: 25,
  value: 200,
  canOwn: isBackerOfLevel(300, 'weapon_special_2'),
};

const weaponSpecial3 = {
  text: t('weaponSpecial3Text'),
  notes: t('weaponSpecial3Notes', { attrs: 17 }),
  str: 17,
  int: 17,
  con: 17,
  value: 200,
  canOwn: isBackerOfLevel(300, 'weapon_special_3'),
};

export {
  armorSpecial0,
  armorSpecial2,
  headSpecial0,
  headSpecial2,
  shieldSpecial0,
  weaponSpecial0,
  weaponSpecial2,
  weaponSpecial3,
};
