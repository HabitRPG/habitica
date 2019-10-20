import t from '../translation';

import { weapon as baseWeapon } from './sets/base';

import { weapon as healerWeapon } from './sets/healer';
import { weapon as rogueWeapon } from './sets/rogue';
import { weapon as warriorWeapon } from './sets/warrior';
import { weapon as wizardWeapon } from './sets/wizard';

import { weapon as armoireWeapon } from './sets/armoire';
import { weapon as mysteryWeapon } from './sets/mystery';
import { weapon as specialWeapon } from './sets/special';

const weapon = {
  base: baseWeapon,

  warrior: warriorWeapon,
  rogue: rogueWeapon,
  wizard: wizardWeapon,
  healer: healerWeapon,

  special: specialWeapon,
  mystery: mysteryWeapon,
  armoire: armoireWeapon,
};

// Add Two Handed message to all weapons
const rtlLanguages = [
  'ae', /* Avestan */
  'ar', /* 'العربية', Arabic */
  'arc', /* Aramaic */
  'bcc', /* 'بلوچی مکرانی', Southern Balochi */
  'bqi', /* 'بختياري', Bakthiari */
  'ckb', /* 'Soranî / کوردی', Sorani */
  'dv', /* Dhivehi */
  'fa', /* 'فارسی', Persian */
  'glk', /* 'گیلکی', Gilaki */
  'he', /* 'עברית', Hebrew */
  'ku', /* 'Kurdî / كوردی', Kurdish */
  'mzn', /* 'مازِرونی', Mazanderani */
  'nqo', /* N'Ko */
  'pnb', /* 'پنجابی', Western Punjabi */
  'ps', /* 'پښتو', Pashto, */
  'sd', /* 'سنڌي', Sindhi */
  'ug', /* 'Uyghurche / ئۇيغۇرچە', Uyghur */
  'ur', /* 'اردو', Urdu */
  'yi', /* 'ייִדיש', Yiddish */
];

for (const key of Object.keys(weapon)) {
  const set = weapon[key];
  for (const weaponKey of Object.keys(set)) {
    const item = set[weaponKey];
    const oldnotes = item.notes;
    item.notes = lang => {
      const twoHandedText = item.twoHanded ? t('twoHandedItem')(lang) : '';

      if (rtlLanguages.indexOf(lang) !== -1) {
        return `${twoHandedText} ${oldnotes(lang)}`;
      }

      return `${oldnotes(lang)} ${twoHandedText}`;
    };
    item.notes.i18nLangFunc = true; // See https://github.com/HabitRPG/habitica/blob/develop/website/common/script/content/translation.js#L8
  }
}

export default weapon;
