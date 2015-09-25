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

//----------------------------------------
// Gear Helpers
//----------------------------------------

export function generateGearSet(gear, options={}) {
  let setName = formatForTranslator(options.setName);
  let gearType = options.gearType;

  each(gear, (item, number) => {
    let text = `${gearType}${setName}${number}Text`;
    let notes = `${gearType}${setName}${number}Notes`;
    let attributes = _getGearAttributes(item);
    let gearDefaults = {
      text: translator(text),
      notes: translator(notes, attributes),
    }

    defaults(item, gearDefaults);
  });
}

function _getGearAttributes(gear) {
  let attr = {};

  if (gear.str) { attr.str = gear.str };
  if (gear.con) { attr.con = gear.con };
  if (gear.int) { attr.int = gear.int };
  if (gear.per) { attr.per = gear.per };

  return attr;
}

//----------------------------------------
// Background Helpers
//----------------------------------------

export function generateBackgrounds(sets) {
  let backgrounds = {};

  each(sets, (names, set) => {
    let setName = `backgrounds${set}`;
    backgrounds[setName] = {};

    each(names, (name) => {
      let formattedName = formatForTranslator(name);

      backgrounds[setName][name] = {
        text: translator(`background${formattedName}Text`),
        notes: translator(`background${formattedName}Notes`),
      };
    });
  });

  return backgrounds;
}

//----------------------------------------
// Egg Helpers
//----------------------------------------

export function generateEggs(set, options={}) {
  let eggs = {};
  let type = options.type;
  let canBuy = options.canBuy;

  each(set, (pet) => {
    eggs[pet] = {
      text: translator(`${type}Egg${pet}Text`),
      mountText: translator(`${type}Egg${pet}MountText`),
      adjective: translator(`${type}Egg${pet}Adjective`),
      canBuy: canBuy,
      value: 3,
      key: pet,
    }

    eggs[pet].notes = translator('eggNotes', {
      eggText: eggs[pet].text,
      eggAdjective: eggs[pet].adjective
    });
  });

  return eggs;
}
