import values from 'lodash/values';
import map from 'lodash/map';
import keys from 'lodash/keys';
import each from 'lodash/each';
import eachRight from 'lodash/eachRight';
import toArray from 'lodash/toArray';
import pickBy from 'lodash/pickBy';
import sortBy from 'lodash/sortBy';
import content from '../content/index';
import i18n from '../i18n';
import getItemInfo from './getItemInfo';

let shops = {};

shops.getMarketCategories = function getMarket (user, language) {
  let categories = [];
  let eggsCategory = {
    identifier: 'eggs',
    text: i18n.t('eggs', language),
    notes: i18n.t('dropsExplanationEggs', language),
  };

  eggsCategory.items = sortBy(values(content.questEggs)
    .filter(egg => egg.canBuy(user))
    .concat(values(content.dropEggs))
    .map(egg => {
      return getItemInfo(user, 'egg', egg, language);
    }), 'key');
  categories.push(eggsCategory);

  let hatchingPotionsCategory = {
    identifier: 'hatchingPotions',
    text: i18n.t('hatchingPotions', language),
    notes: i18n.t('dropsExplanation', language),
  };
  hatchingPotionsCategory.items = sortBy(values(content.hatchingPotions)
    .filter(hp => !hp.limited)
    .map(hatchingPotion => {
      return getItemInfo(user, 'hatchingPotion', hatchingPotion, language);
    }), 'key');
  categories.push(hatchingPotionsCategory);

  let premiumHatchingPotionsCategory = {
    identifier: 'premiumHatchingPotions',
    text: i18n.t('magicHatchingPotions', language),
    notes: i18n.t('premiumPotionNoDropExplanation', language),
  };
  premiumHatchingPotionsCategory.items = sortBy(values(content.hatchingPotions)
    .filter(hp => hp.limited && hp.canBuy())
    .map(premiumHatchingPotion => {
      return getItemInfo(user, 'premiumHatchingPotion', premiumHatchingPotion, language);
    }), 'key');
  if (premiumHatchingPotionsCategory.items.length > 0) {
    categories.push(premiumHatchingPotionsCategory);
  }

  let foodCategory = {
    identifier: 'food',
    text: i18n.t('food', language),
    notes: i18n.t('dropsExplanation', language),
  };
  foodCategory.items = sortBy(values(content.food)
    .filter(food => food.canDrop || food.key === 'Saddle')
    .map(foodItem => {
      return getItemInfo(user, 'food', foodItem, language);
    }), 'key');
  categories.push(foodCategory);

  return categories;
};

shops.getQuestShopCategories = function getQuestShopCategories (user, language) {
  let categories = [];

  /*
   * ---------------------------------------------------------------
   * Quest Bundles
   * ---------------------------------------------------------------
   *
   * These appear in the Content index.js as follows:
   * {
   *   bundleName: {
   *     key: 'bundleName',
   *     text: t('bundleNameText'),
   *     notes: t('bundleNameNotes'),
   *     group: 'group',
   *     bundleKeys: [
   *       'quest1',
   *       'quest2',
   *       'quest3',
   *     ],
   *     canBuy () {
   *       return true when bundle is available for purchase;
   *     },
   *   type: 'quests',
   *   value: 7,
   *   },
   *   secondBundleName: {
   *     ...
   *   },
   * }
   *
   * After filtering and mapping, the Shop will produce:
   *
   * [
   *   {
   *     identifier: 'bundle',
   *     text: 'i18ned string for bundles category',
   *     items: [
   *       {
   *         key: 'bundleName',
   *         text: 'i18ned string for bundle title',
   *         notes: 'i18ned string for bundle description',
   *         group: 'group',
   *         value: 7,
   *         currency: 'gems',
   *         class: 'quest_bundle_bundleName',
   *         purchaseType: 'bundles',
   *       },
   *       { second bundle },
   *     ],
   *   },
   *   { main quest category 1 },
   *   ...
   * ]
   *
   */

  let bundleCategory = {
    identifier: 'bundle',
    text: i18n.t('questBundles', language),
  };

  bundleCategory.items = sortBy(values(content.bundles)
    .filter(bundle => bundle.type === 'quests' && bundle.canBuy())
    .map(bundle => {
      return getItemInfo(user, 'questBundle', bundle, language);
    }));

  if (bundleCategory.items.length > 0) {
    categories.push(bundleCategory);
  }

  each(content.userCanOwnQuestCategories, type => {
    let category = {
      identifier: type,
      text: i18n.t(`${type}Quests`, language),
    };

    category.items = content.questsByLevel
      .filter(quest => quest.canBuy(user) && quest.category === type)
      .map(quest => {
        return getItemInfo(user, 'quest', quest, language);
      });

    categories.push(category);
  });

  return categories;
};

shops.getTimeTravelersCategories = function getTimeTravelersCategories (user, language) {
  let categories = [];
  let stable = {pets: 'Pet-', mounts: 'Mount_Icon_'};
  for (let type in stable) {
    if (stable.hasOwnProperty(type)) {
      let category = {
        identifier: type,
        text: i18n.t(type, language),
        items: [],
      };

      for (let key in content.timeTravelStable[type]) {
        if (content.timeTravelStable[type].hasOwnProperty(key)) {
          if (!user.items[type][key]) {
            let item = {
              key,
              text: content.timeTravelStable[type][key](language),
              class: stable[type] + key,
              type,
              purchaseType: type,
              value: 1,
              notes: '',
              locked: false,
              currency: 'hourglasses',
              pinType: 'TODO',
            };
            category.items.push(item);
          }
        }
      }
      if (category.items.length > 0) {
        categories.push(category);
      }
    }
  }

  let sets = content.timeTravelerStore(user);
  for (let setKey in  sets) {
    if (sets.hasOwnProperty(setKey)) {
      let set = sets[setKey];
      let category = {
        identifier: set.key,
        text: set.text(language),
        path: `mystery.${set.key}`,
        pinType: 'mystery_set',
        purchaseAll: true,
      };

      category.items = map(set.items, item => {
        return {
          key: item.key,
          text: item.text(language),
          notes: item.notes(language),
          type: item.type,
          purchaseType: 'gear',
          value: 1,
          locked: false,
          currency: 'hourglasses',
          class: `shop_${item.key}`,
          pinKey: `timeTravelers!gear.flat.${item.key}`,
        };
      });
      if (category.items.length > 0) {
        categories.push(category);
      }
    }
  }

  return categories;
};

// To switch seasons/available inventory, edit the AVAILABLE_SETS object to whatever should be sold.
// let AVAILABLE_SETS = {
//   setKey: i18n.t('setTranslationString', language),
// };
shops.getSeasonalShopCategories = function getSeasonalShopCategories (user, language) {
  const AVAILABLE_SETS = {
    summerHealer: i18n.t('reefSeahealerSet', language),
    summer2015Healer: i18n.t('strappingSailorSet', language),
    summer2016Healer: i18n.t('summer2016SeahorseHealerSet', language),
    summerMage: i18n.t('emeraldMermageSet', language),
    summer2015Mage: i18n.t('shipSoothsayerSet', language),
    summer2016Mage: i18n.t('summer2016DolphinMageSet', language),
    summerRogue: i18n.t('roguishPirateSet', language),
    summer2015Rogue: i18n.t('reefRenegadeSet', language),
    summer2016Rogue: i18n.t('summer2016EelSet', language),
    summerWarrior: i18n.t('daringSwashbucklerSet', language),
    summer2015Warrior: i18n.t('sunfishWarriorSet', language),
    summer2016Warrior: i18n.t('summer2016SharkWarriorSet', language),
  };

  const AVAILABLE_SPELLS = [
    'seafoam',
  ];

  const AVAILABLE_QUESTS = [
  ];

  let categories = [];

  let flatGearArray = toArray(content.gear.flat);

  let spells = pickBy(content.spells.special, (spell, key) => {
    return AVAILABLE_SPELLS.indexOf(key) !== -1;
  });

  if (keys(spells).length > 0) {
    let category = {
      identifier: 'spells',
      text: i18n.t('seasonalItems', language),
    };

    category.items = map(spells, (spell) => {
      return getItemInfo(user, 'seasonalSpell', spell, language);
    });

    categories.push(category);
  }

  let quests = pickBy(content.quests, (quest, key) => {
    return AVAILABLE_QUESTS.indexOf(key) !== -1;
  });

  if (keys(quests).length > 0) {
    let category = {
      identifier: 'quests',
      text: i18n.t('quests', language),
    };

    category.items = map(quests, (quest) => {
      return getItemInfo(user, 'seasonalQuest', quest, language);
    });

    categories.push(category);
  }

  for (let key in AVAILABLE_SETS) {
    if (AVAILABLE_SETS.hasOwnProperty(key)) {
      let category = {
        identifier: key,
        text: AVAILABLE_SETS[key],
      };

      category.items = flatGearArray.filter((gear) => {
        return user.items.gear.owned[gear.key] === undefined && gear.index === key;
      }).map(gear => {
        return getItemInfo(null, 'gear', gear, language);
      });

      if (category.items.length > 0) {
        category.specialClass = category.items[0].specialClass;
        categories.push(category);
      }
    }
  }

  return categories;
};

shops.getBackgroundShopSets = function getBackgroundShopSets (language) {
  let sets = [];

  eachRight(content.backgrounds, (group, key) => {
    let set = {
      identifier: key,
      text: i18n.t(key, language),
    };

    set.items = map(group, (background) => {
      return getItemInfo(null, 'background', background, language);
    });

    sets.push(set);
  });

  return sets;
};

module.exports = shops;
