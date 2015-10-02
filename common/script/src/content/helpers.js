import {each, defaults, assign} from 'lodash';
import capitalize from 'lodash.capitalize';
import camelCase from 'lodash.camelcase';

import i18n from '../i18n';

//----------------------------------------
// Translator Helpers
//----------------------------------------
export function translator(string, vars={a: 'a'}) {
  let func = (lang) => {
    return i18n.t(string, vars, lang);
  };

  func.i18nLangFunc = true; // Trick to recognize this type of function

  return func;
};

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
};

//----------------------------------------
// Set Defaults Helpers
//----------------------------------------

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

export function setFoodDefaults(food, options={}) {
  each(food, (item, name) => {
    let formattedName = formatForTranslator(name);
    let canBuy = () => { return options.canBuy; };

    defaults(item, {
      key: name,
      text: translator(`food${formattedName}`),
      notes: translator('foodNotes'),
      value: 1,
      canBuy: canBuy,
      canDrop: options.canDrop || false,
    });
  });
};

export function setHatchingPotionDefaults(hatchingPotions) {
  each(hatchingPotions, (potion, key) => {
    let text = translator(`hatchingPotion${key}`);
    defaults(potion, {
      key: key,
      value: 2,
      text: text,
      canBuy: () => { return true },
      notes: translator('hatchingPotionNotes', {
        potText: text
      }),
    });
  });
};

export function setQuestDefaults(quests) {
  each(quests, function(quest, key) {
    let formattedName = formatForTranslator(key);

    let questDefaults = {
      key: key,
      text: translator(`quest${formattedName}Text`),
      notes: translator(`quest${formattedName}Notes`),
      canBuy: () => { return true; },
      value: 4,
    };

    let questBossDefaults = {
      name: translator(`quest${formattedName}Boss`),
      str: 1,
      def: 1,
    };

    let questBossRageDefaults = {
      title: translator('bossRageTitle'),
      description: translator('bossRageDescription'),
    };

    defaults(quest, questDefaults);

    let boss = quest.boss;

    if (boss) {
      defaults(boss, questBossDefaults);

      if (boss.rage) {
        defaults(boss.rage, questBossRageDefaults);
      }
    }
  });
};

export function setQuestSetDefaults(quests, mainDefaultsFunction, dropDefaultsFunction) {
  each(quests, (quest, name) => {
    let formattedName = formatForTranslator(name);
    let mainDefaults = mainDefaultsFunction(formattedName);

    defaults(quest, mainDefaults);

    if (quest.drop && dropDefaultsFunction) {
      let dropDefaults = dropDefaultsFunction(formattedName);
      defaults(quest.drop, dropDefaults);
    }
  });
};

export function setGearSetDefaults(gearSet, options={}) {
  let setName = formatForTranslator(options.setName);

  each(gearSet, (gear, gearType) => {
    each(gear, (item, key) => {
      let formattedName = formatForTranslator(key);

      let text = `${gearType}${setName}${formattedName}Text`;
      let notes = `${gearType}${setName}${formattedName}Notes`;
      let attributes = _getGearAttributes(item);
      let gearDefaults = {
        text: translator(text),
        notes: translator(notes, attributes),
        canBuy: () => { return false; },
      }

      defaults(item, gearDefaults);
    });
  });
};

//----------------------------------------
// Generators
//----------------------------------------

export function generateBackgrounds(sets) {
  each(sets, (names, set) => {
    sets[set] = {};

    each(names, (name) => {
      let formattedName = formatForTranslator(name);

      sets[set][name] = {
        text: translator(`background${formattedName}Text`),
        notes: translator(`background${formattedName}Notes`),
      };
    });
  });
};

export function generateEggs(set, options={}) {
  let eggs = {};
  let type = options.type;

  each(set, (pet) => {
    let text = translator(`${type}Egg${pet}Text`);
    let adj = translator(`${type}Egg${pet}Adjective`);
    let canBuy = options.canBuy(pet);

    eggs[pet] = {
      text: text,
      mountText: translator(`${type}Egg${pet}MountText`),
      adjective: adj,
      canBuy: canBuy,
      value: 3,
      key: pet,
      notes: translator('eggNotes', {
        eggText: text,
        eggAdjective: adj,
      }),
    }
  });

  return eggs;
};

//----------------------------------------
// Spell Helpers
//----------------------------------------

export function diminishingReturns(bonus, max, halfway=max/2) {
  return max * (bonus / (bonus + halfway));
};

export function calculateBonus(value, stat, crit=1, stat_scale=0.5) {
  return (value < 0 ? 1 : value + 1) + (stat * stat_scale * crit);
};

//----------------------------------------
// Gear Helpers
//----------------------------------------

function _getGearAttributes(gear) {
  let attr = {};

  if (gear.str) { attr.str = gear.str };
  if (gear.con) { attr.con = gear.con };
  if (gear.int) { attr.int = gear.int };
  if (gear.per) { attr.per = gear.per };

  return attr;
}
