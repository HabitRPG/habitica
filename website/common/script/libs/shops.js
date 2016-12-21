import _ from 'lodash';
import pickBy from 'lodash.pickby'; // Not available in lodash 3
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

  eggsCategory.items = _(content.questEggs)
    .values()
    .filter(egg => egg.canBuy(user))
    .concat(_.values(content.dropEggs))
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
    }).sortBy('key').value();
  categories.push(eggsCategory);

  let hatchingPotionsCategory = {
    identifier: 'hatchingPotions',
    text: i18n.t('hatchingPotions', language),
    notes: i18n.t('dropsExplanation', language),
  };
  hatchingPotionsCategory.items = _(content.hatchingPotions)
    .values()
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
    }).sortBy('key').value();
  categories.push(hatchingPotionsCategory);

  let premiumHatchingPotionsCategory = {
    identifier: 'premiumHatchingPotions',
    text: i18n.t('magicHatchingPotions', language),
    notes: i18n.t('premiumPotionNoDropExplanation', language),
  };
  premiumHatchingPotionsCategory.items = _(content.hatchingPotions)
    .values()
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
    }).sortBy('key').value();
  categories.push(premiumHatchingPotionsCategory);

  let foodCategory = {
    identifier: 'food',
    text: i18n.t('food', language),
    notes: i18n.t('dropsExplanation', language),
  };
  foodCategory.items = _(content.food)
    .values()
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
    }).sortBy('key').value();
  categories.push(foodCategory);

  return categories;
};

shops.getQuestShopCategories = function getQuestShopCategories (user, language) {
  let categories = [];

  _.each(content.userCanOwnQuestCategories, type => {
    let category = {
      identifier: type,
      text: i18n.t(`${type}Quests`, language),
    };

    category.items = _(content.questsByLevel)
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
      }).value();

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

      category.items = _.map(set.items, item => {
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
    yeti: i18n.t('yetiSet', language),
    ski: i18n.t('skiSet', language),
    candycane: i18n.t('candycaneSet', language),
    snowflake: i18n.t('snowflakeSet', language),
    winter2015Healer: i18n.t('soothingSkaterSet', language),
    winter2015Mage: i18n.t('northMageSet', language),
    winter2015Rogue: i18n.t('icicleDrakeSet', language),
    winter2015Warrior: i18n.t('gingerbreadSet', language),
    winter2016Healer: i18n.t('festiveFairySet', language),
    winter2016Mage: i18n.t('snowboardingSet', language),
    winter2016Rogue: i18n.t('cocoaSet', language),
    winter2016Warrior: i18n.t('snowDaySet', language),
  };

  const AVAILABLE_SPELLS = [
  ];

  const AVAILABLE_QUESTS = [
    'evilsanta',
    'evilsanta2',
  ];

  let categories = [];

  let flatGearArray = _.toArray(content.gear.flat);

  let spells = pickBy(content.spells.special, (spell, key) => {
    return _.indexOf(AVAILABLE_SPELLS, key) !== -1;
  });

  if (_.keys(spells).length > 0) {
    let category = {
      identifier: 'spells',
      text: i18n.t('seasonalItems', language),
    };

    category.items = _.map(spells, (spell, key) => {
      return {
        key,
        text: spell.text(language),
        notes: spell.notes(language),
        value: spell.value,
        type: 'special',
        currency: 'gold',
        locked: false,
        purchaseType: 'spells',
      };
    });

    categories.push(category);
  }

  let quests = pickBy(content.quests, (quest, key) => {
    return _.indexOf(AVAILABLE_QUESTS, key) !== -1;
  });

  if (_.keys(quests).length > 0) {
    let category = {
      identifier: 'quests',
      text: i18n.t('quests', language),
    };

    category.items = _.map(quests, (quest, key) => {
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

      category.items = _(flatGearArray).filter((gear) => {
        if (gear.index !== key) {
          return false;
        }
        return user.items.gear.owned[gear.key] === undefined;
      }).where({index: key}).map(gear => {
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
        };
      }).value();
      if (category.items.length > 0) {
        categories.push(category);
      }
    }
  }

  return categories;
};

shops.getBackgroundShopSets = function getBackgroundShopSets (language) {
  let sets = [];

  _.eachRight(content.backgrounds, (group, key) => {
    let set = {
      identifier: key,
      text: i18n.t(key, language),
    };

    set.items = _(group)
      .map((background, bgKey) => {
        return {
          key: bgKey,
          text: background.text(language),
          notes: background.notes(language),
          value: background.price,
          currency: background.currency || 'gems',
          purchaseType: 'backgrounds',
        };
      }).value();

    sets.push(set);
  });

  return sets;
};

module.exports = shops;
