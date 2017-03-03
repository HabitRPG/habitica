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

let shops = {};

function lockQuest (quest, user) {
  if (quest.lvl && user.stats.lvl < quest.lvl) return true;
  if (quest.unlockCondition && (quest.key === 'moon1' || quest.key === 'moon2' || quest.key === 'moon3')) {
    return user.loginIncentives < quest.unlockCondition.incentiveThreshold;
  }
  if (user.achievements.quests) return quest.previous && !user.achievements.quests[quest.previous];
  return quest.previous;
}

shops.getMarketCategories = function getMarket (user, language) {
  let categories = [];
  let eggsCategory = {
    identifier: 'eggs',
    text: i18n.t('eggs', language),
    notes: i18n.t('dropsExplanation', language),
  };

  eggsCategory.items = sortBy(values(content.questEggs)
    .filter(egg => egg.canBuy(user))
    .concat(values(content.dropEggs))
    .map(egg => {
      return {
        key: egg.key,
        text: i18n.t('egg', {eggType: egg.text()}, language),
        notes: egg.notes(language),
        value: egg.value,
        class: `Pet_Egg_${egg.key}`,
        locked: false,
        currency: 'gems',
        purchaseType: 'eggs',
      };
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
      return {
        key: hatchingPotion.key,
        text: hatchingPotion.text(language),
        notes: hatchingPotion.notes(language),
        class: `Pet_HatchingPotion_${hatchingPotion.key}`,
        value: hatchingPotion.value,
        locked: false,
        currency: 'gems',
        purchaseType: 'hatchingPotions',
      };
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
      return {
        key: premiumHatchingPotion.key,
        text: premiumHatchingPotion.text(language),
        notes: `${premiumHatchingPotion.notes(language)} ${premiumHatchingPotion._addlNotes(language)}`,
        class: `Pet_HatchingPotion_${premiumHatchingPotion.key}`,
        value: premiumHatchingPotion.value,
        locked: false,
        currency: 'gems',
        purchaseType: 'hatchingPotions',
      };
    }), 'key');
  categories.push(premiumHatchingPotionsCategory);

  let foodCategory = {
    identifier: 'food',
    text: i18n.t('food', language),
    notes: i18n.t('dropsExplanation', language),
  };
  foodCategory.items = sortBy(values(content.food)
    .filter(food => food.canDrop || food.key === 'Saddle')
    .map(foodItem => {
      return {
        key: foodItem.key,
        text: foodItem.text(language),
        notes: foodItem.notes(language),
        class: `Pet_Food_${foodItem.key}`,
        value: foodItem.value,
        locked: false,
        currency: 'gems',
        purchaseType: 'food',
      };
    }), 'key');
  categories.push(foodCategory);

  return categories;
};

shops.getQuestShopCategories = function getQuestShopCategories (user, language) {
  let categories = [];

  each(content.userCanOwnQuestCategories, type => {
    let category = {
      identifier: type,
      text: i18n.t(`${type}Quests`, language),
    };

    category.items = content.questsByLevel
      .filter(quest => quest.canBuy(user) && quest.category === type)
      .map(quest => {
        let locked = lockQuest(quest, user);
        return {
          key: quest.key,
          text: quest.text(language),
          notes: quest.notes(language),
          value: quest.goldValue ? quest.goldValue : quest.value,
          currency: quest.goldValue ? 'gold' : 'gems',
          locked,
          unlockCondition: quest.unlockCondition,
          drop: quest.drop,
          boss: quest.boss,
          collect: quest.collect,
          lvl: quest.lvl,
          class: locked ? `inventory_quest_scroll_locked inventory_quest_scroll_${quest.key}_locked` : `inventory_quest_scroll inventory_quest_scroll_${quest.key}`,
          purchaseType: 'quests',
        };
      });

    categories.push(category);
  });

  return categories;
};

shops.getTimeTravelersCategories = function getTimeTravelersCategories (user, language) {
  let categories = [];
  let stable = {pets: 'Pet-', mounts: 'Mount_Head_'};
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
  };

  const AVAILABLE_SPELLS = [
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

    category.items = map(spells, (spell, key) => {
      return {
        key,
        text: spell.text(language),
        notes: spell.notes(language),
        value: spell.value,
        type: 'special',
        currency: 'gold',
        locked: false,
        purchaseType: 'spells',
        class: `inventory_special_${key}`,
      };
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

    category.items = map(quests, (quest, key) => {
      return {
        key,
        text: quest.text(language),
        notes: quest.notes(language),
        value: quest.value,
        type: 'quests',
        currency: 'gems',
        locked: false,
        drop: quest.drop,
        boss: quest.boss,
        collect: quest.collect,
        class: `inventory_quest_scroll_${key}`,
        purchaseType: 'quests',
      };
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
        return {
          key: gear.key,
          text: gear.text(language),
          notes: gear.notes(language),
          value: gear.twoHanded ? 2 : 1,
          type: gear.type,
          specialClass: gear.specialClass,
          locked: false,
          currency: 'gems',
          purchaseType: 'gear',
          class: `shop_${gear.key}`,
        };
      });

      if (category.items.length > 0) {
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

    set.items = map(group, (background, bgKey) => {
      return {
        key: bgKey,
        text: background.text(language),
        notes: background.notes(language),
        value: background.price,
        currency: background.currency || 'gems',
        purchaseType: 'backgrounds',
      };
    });

    sets.push(set);
  });

  return sets;
};

module.exports = shops;
