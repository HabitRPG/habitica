import {each, defaults, assign} from 'lodash';
import capitalize from 'lodash.capitalize';
import camelCase from 'lodash.camelcase';

require('coffee-script');
import i18n from '../../../script/i18n.coffee';

//----------------------------------------
// Translator Helper
//----------------------------------------
export function translator(string, vars={a: 'a'}) {
  let func = (lang) => {
    return i18n.t(string, vars, lang);
  };

  func.i18nLangFunc = true; // Trick to recognize this type of function

  return func;
};

//----------------------------------------
// Formatting Helper
//----------------------------------------

export function formatForTranslator(name) {
  let camelCasedName = camelCase(name);
  let capitalCamelCasedName = capitalize(camelCasedName);

  return capitalCamelCasedName;
};

//----------------------------------------
// Object Merger
//----------------------------------------

export function merge(array=[]) {
  let mergedObject = {};

  each(array, (item) => {
    assign(mergedObject, item);
  });

  return mergedObject;
}

//----------------------------------------
// Spell Helpers
//----------------------------------------

export function diminishingReturns(bonus, max, halfway=max/2) {
  return max * (bonus / (bonus + halfway));
};

export function calculateBonus(value, stat, crit=1, stat_scale=0.5) {
  return (value < 0 ? 1 : value + 1) + (stat * stat_scale * crit);
};

export function setSpellDefaults (className, spells) {
  let capitalClassName = formatForTranslator(className);

  each(spells, (spell, key) => {
    let capitalSpellKey = formatForTranslator(key);
    let spellDefaults = {
      text: translator(`spell${capitalClassName}${capitalSpellKey}Text`),
      notes: translator(`spell${capitalClassName}${capitalSpellKey}Notes`),
    };

    defaults(spell, spellDefaults);
  });
};

//----------------------------------------
// Food Helpers
//----------------------------------------

export function setFoodDefaults(food, options={}) {
  each(food, (item, name) => {
    let formattedName = formatForTranslator(name);

    defaults(item, {
      canBuy: options.canBuy || false,
      canDrop: options.canDrop || false,
      text: translator(`food${formattedName}`),
      value: 1,
      key: name,
      notes: translator('foodNotes'),
    });
  });
};
