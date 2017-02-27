import { ownsItem } from '../../gear-helper';
import t from '../../../translation';

let isBackerOfLevel = (tierRequirement, ownedItem) => {
  return (user) => {
    let backer = user.backer;
    let tier = Number(backer && backer.tier);

    return tier >= tierRequirement || ownsItem(ownedItem)(user);
  };
};

let armorSpecial0 = {
  text: t('armorSpecial0Text'),
  notes: t('armorSpecial0Notes', { con: 20 }),
  textlocaleKey: 'armorSpecial0Text',
  notesLocalKey: 'armorSpecial0Notes',
  con: 20,
  value: 150,
  canOwn: isBackerOfLevel(45, 'armor_special_0'),
};

let armorSpecial2 = {
  text: t('armorSpecial2Text'),
  notes: t('armorSpecial2Notes', { attrs: 25 }),
  textlocaleKey: 'armorSpecial2Text',
  notesLocalKey: 'armorSpecial2Notes',
  int: 25,
  con: 25,
  value: 200,
  canOwn: isBackerOfLevel(300, 'armor_special_2'),
};

let headSpecial0 = {
  text: t('headSpecial0Text'),
  notes: t('headSpecial0Notes', { int: 20 }),
  textlocaleKey: 'headSpecial0Text',
  notesLocalKey: 'headSpecial0Notes',
  int: 20,
  value: 150,
  canOwn: isBackerOfLevel(45, 'head_special_0'),
};

let headSpecial2 = {
  text: t('headSpecial2Text'),
  notes: t('headSpecial2Notes', { attrs: 25 }),
  textlocaleKey: 'headSpecial2Text',
  notesLocalKey: 'headSpecial2Notes',
  int: 25,
  str: 25,
  value: 200,
  canOwn: isBackerOfLevel(300, 'head_special_2'),
};

let shieldSpecial0 = {
  text: t('shieldSpecial0Text'),
  notes: t('shieldSpecial0Notes', { per: 20 }),
  textlocaleKey: 'shieldSpecial0Text',
  notesLocalKey: 'shieldSpecial0Notes',
  per: 20,
  value: 150,
  canOwn: isBackerOfLevel(45, 'shield_special_0'),
};

let weaponSpecial0 = {
  text: t('weaponSpecial0Text'),
  notes: t('weaponSpecial0Notes', { str: 20 }),
  textlocaleKey: 'weaponSpecial0Text',
  notesLocalKey: 'weaponSpecial0Notes',
  str: 20,
  value: 150,
  canOwn: isBackerOfLevel(70, 'weapon_special_0'),
};

let weaponSpecial2 = {
  text: t('weaponSpecial2Text'),
  notes: t('weaponSpecial2Notes', { attrs: 25 }),
  textlocaleKey: 'weaponSpecial2Text',
  notesLocalKey: 'weaponSpecial2Notes',
  str: 25,
  per: 25,
  value: 200,
  canOwn: isBackerOfLevel(300, 'weapon_special_2'),
};

let weaponSpecial3 = {
  text: t('weaponSpecial3Text'),
  notes: t('weaponSpecial3Notes', { attrs: 17 }),
  textlocaleKey: 'weaponSpecial3Text',
  notesLocalKey: 'weaponSpecial3Notes',
  str: 17,
  int: 17,
  con: 17,
  value: 200,
  canOwn: isBackerOfLevel(300, 'weapon_special_3'),
};

let backerSet = {
  armorSpecial0,
  armorSpecial2,
  headSpecial0,
  headSpecial2,
  shieldSpecial0,
  weaponSpecial0,
  weaponSpecial2,
  weaponSpecial3,
};

module.exports = backerSet;
