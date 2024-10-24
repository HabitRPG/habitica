import values from 'lodash/values';
import map from 'lodash/map';
import keys from 'lodash/keys';
import get from 'lodash/get';
import each from 'lodash/each';
import filter from 'lodash/filter';
import eachRight from 'lodash/eachRight';
import toArray from 'lodash/toArray';
import pickBy from 'lodash/pickBy';
import sortBy from 'lodash/sortBy';
import content from '../content/index';
import i18n from '../i18n';
import getItemInfo from './getItemInfo';
import updateStore from './updateStore';
import seasonalShopConfig from './shops-seasonal.config';
import featuredItems from '../content/shop-featuredItems';

import getOfficialPinnedItems from './getOfficialPinnedItems';
import { getClassName } from './getClassName';
import { getScheduleMatchingGroup } from '../content/constants/schedule';

const shops = {};

/* Market */

shops.getMarketShop = function getMarketShop (user, language) {
  const officialPinned = getOfficialPinnedItems(user);
  return {
    identifier: 'market',
    text: i18n.t('market'),
    notes: i18n.t('welcomeMarketMobile'),
    imageName: 'npc_alex',
    categories: shops.getMarketCategories(user, language),
    featured: {
      text: i18n.t('featuredItems'),
      items: officialPinned.length > 0
        ? officialPinned.map(i => getItemInfo(user, i.type, get(content, i.path)))
        : featuredItems.market().map(i => getItemInfo(user, i.type, get(content, i.path))),
    },
  };
};

shops.getMarketCategories = function getMarket (user, language) {
  const officialPinnedItems = getOfficialPinnedItems(user);

  const categories = [];
  const eggsCategory = {
    identifier: 'eggs',
    text: i18n.t('eggs', language),
    notes: i18n.t('dropsExplanationEggs', language),
  };

  eggsCategory.items = sortBy(values(content.questEggs)
    .filter(egg => egg.canBuy(user))
    .concat(values(content.dropEggs))
    .map(egg => getItemInfo(user, 'eggs', egg, officialPinnedItems, language)), 'key');
  categories.push(eggsCategory);

  const hatchingPotionsCategory = {
    identifier: 'hatchingPotions',
    text: i18n.t('hatchingPotions', language),
    notes: i18n.t('dropsExplanation', language),
  };
  hatchingPotionsCategory.items = sortBy(values(content.hatchingPotions)
    .filter(hp => !hp.limited)
    .map(hatchingPotion => getItemInfo(user, 'hatchingPotions', hatchingPotion, officialPinnedItems, language)), 'key');
  categories.push(hatchingPotionsCategory);

  const premiumHatchingPotionsCategory = {
    identifier: 'premiumHatchingPotions',
    text: i18n.t('magicHatchingPotions', language),
    notes: i18n.t('premiumPotionNoDropExplanation', language),
  };
  const matchers = getScheduleMatchingGroup('premiumHatchingPotions');
  premiumHatchingPotionsCategory.items = sortBy(values(content.hatchingPotions)
    .filter(hp => hp.limited
      && (matchers.match(hp.key) || (hp.questPotion === true && hp.canBuy(user))))
    .map(premiumHatchingPotion => {
      if (premiumHatchingPotion.questPotion) {
        return getItemInfo(user, 'premiumHatchingPotion', premiumHatchingPotion, officialPinnedItems, language);
      }
      return getItemInfo(user, 'premiumHatchingPotion', premiumHatchingPotion, officialPinnedItems, language, matchers);
    }), 'key');
  if (premiumHatchingPotionsCategory.items.length > 0) {
    categories.push(premiumHatchingPotionsCategory);
  }

  const foodCategory = {
    identifier: 'food',
    text: i18n.t('food', language),
    notes: i18n.t('dropsExplanation', language),
  };
  foodCategory.items = sortBy(values(content.food)
    .filter(food => food.canDrop || food.key === 'Saddle')
    .map(foodItem => getItemInfo(user, 'food', foodItem, officialPinnedItems, language)), 'key');
  categories.push(foodCategory);

  return categories;
};

function getTranslatedClassName (classType, language) {
  return i18n.t(getClassName(classType), language);
}

// TODO Refactor the `.locked` logic
shops.checkMarketGearLocked = function checkMarketGearLocked (user, items) {
  const result = filter(items, ['pinType', 'marketGear']);
  const officialPinnedItems = getOfficialPinnedItems(user);
  const availableGear = map(updateStore(user, result.map(item => item.key)), item => getItemInfo(user, 'marketGear', item, officialPinnedItems).path);
  const { pinnedSets } = seasonalShopConfig();
  for (const gear of result) {
    if (gear.klass !== user.stats.class) {
      gear.locked = true;
    }

    if (!gear.locked && !availableGear.includes(gear.path)) {
      gear.locked = true;
    }

    if (gear.canOwn) {
      gear.locked = !gear.canOwn(user);
    }

    const itemOwned = user.items.gear.owned[gear.key];

    if (itemOwned === false && !availableGear.includes(gear.path)) {
      gear.locked = true;
    }

    if (Boolean(gear.specialClass) && Boolean(gear.set)) {
      const currentSet = gear.set === pinnedSets[gear.specialClass];

      gear.locked = currentSet && user.stats.class !== gear.specialClass;
    }

    gear.owned = itemOwned;

    // @TODO: I'm not sure what the logic for locking is supposed to be
    // But, I am pretty sure if we pin an armoire item, it needs to be unlocked
    if (gear.klass === 'armoire') {
      gear.locked = false;
    }
  }
};

shops.getMarketGearCategories = function getMarketGear (user, language) {
  const categories = [];
  const officialPinnedItems = getOfficialPinnedItems(user);
  const { pinnedSets } = seasonalShopConfig();

  const gearMatcher = getScheduleMatchingGroup('seasonalGear');

  for (const classType of content.classes) {
    const category = {
      identifier: classType,
      text: getTranslatedClassName(classType, language),
    };

    const result = filter(content.gear.flat, gearItem => {
      if (gearItem.klass === classType) return true;
      if (
        gearItem.specialClass === classType
        && user.items.gear.owned[gearItem.key] !== false
        && gearItem.set === pinnedSets[gearItem.specialClass]
      ) return true;
      return false;
    });

    category.items = map(result, e => {
      if (e.set === pinnedSets[e.specialClass]) {
        return getItemInfo(user, 'marketGear', e, officialPinnedItems, language, gearMatcher);
      }
      return getItemInfo(user, 'marketGear', e, officialPinnedItems);
    });

    const specialGear = filter(content.gear.flat, gear => user.items.gear.owned[gear.key] === false
        && gear.specialClass === classType
        && gear.klass === 'special');

    each(specialGear, gear => {
      category.items.push(getItemInfo(user, 'marketGear', gear));
    });

    shops.checkMarketGearLocked(user, category.items);
    categories.push(category);
  }

  const nonClassCategory = {
    identifier: 'none',
    text: i18n.t('none', language),
  };

  const specialNonClassGear = filter(content.gear.flat, gear => !user.items.gear.owned[gear.key]
      && content.classes.indexOf(gear.klass) === -1
      && content.classes.indexOf(gear.specialClass) === -1
      && (gear.canOwn && gear.canOwn(user)));

  nonClassCategory.items = map(specialNonClassGear, e => getItemInfo(user, 'marketGear', e));

  shops.checkMarketGearLocked(user, nonClassCategory.items);
  categories.push(nonClassCategory);
  return categories;
};

/* Quests */

shops.getQuestShop = function getQuestShop (user, language) {
  return {
    identifier: 'questShop',
    text: i18n.t('quests'),
    notes: i18n.t('ianTextMobile'),
    imageName: 'npc_ian',
    categories: shops.getQuestShopCategories(user, language),
    featured: {
      text: i18n.t('featuredQuests'),
      items: featuredItems.quests().map(i => getItemInfo(user, i.type, get(content, i.path))),
    },
  };
};

shops.getQuestShopCategories = function getQuestShopCategories (user, language) {
  const categories = [];
  const officialPinnedItems = getOfficialPinnedItems(user);

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

  const bundleCategory = {
    identifier: 'bundle',
    text: i18n.t('questBundles', language),
  };

  const bundleMatchers = getScheduleMatchingGroup('bundles');
  bundleCategory.items = sortBy(values(content.bundles)
    .filter(bundle => bundle.type === 'quests'
      && bundleMatchers.match(bundle.key))
    .map(bundle => getItemInfo(user, 'bundles', bundle, officialPinnedItems, language, bundleMatchers)));

  if (bundleCategory.items.length > 0) {
    categories.push(bundleCategory);
  }

  each(content.userCanOwnQuestCategories, type => {
    const category = {
      identifier: type,
      text: i18n.t(`${type}Quests`, language),
    };

    let filteredQuests = content.questsByLevel
      .filter(quest => quest.canBuy(user) && quest.category === type);

    if (type === 'pet' || type === 'hatchingPotion') {
      const matchers = getScheduleMatchingGroup(`${type}Quests`);
      filteredQuests = filteredQuests.filter(quest => matchers.match(quest.key))
        .map(quest => getItemInfo(user, 'quests', quest, officialPinnedItems, language, matchers));
    } else {
      filteredQuests = filteredQuests
        .map(quest => getItemInfo(user, 'quests', quest, officialPinnedItems, language));
    }

    category.items = filteredQuests;
    if (category.items.length > 0) {
      categories.push(category);
    }
  });

  return categories;
};

/* Time Travelers */

shops.getTimeTravelersShop = function getTimeTravelersShop (user, language) {
  const hasTrinkets = user.purchased.plan.consecutive.trinkets > 0;

  return {
    identifier: 'timeTravelersShop',
    text: i18n.t('timeTravelers'),
    opened: hasTrinkets,
    notes: hasTrinkets ? i18n.t('timeTravelersPopover') : i18n.t('timeTravelersPopoverNoSubMobile'),
    imageName: hasTrinkets ? 'npc_timetravelers_active' : 'npc_timetravelers',
    categories: shops.getTimeTravelersCategories(user, language),
  };
};

shops.getTimeTravelersCategories = function getTimeTravelersCategories (user, language) {
  const categories = [];
  const stable = { pets: 'Pet-', mounts: 'Mount_Icon_' };

  const officialPinnedItems = getOfficialPinnedItems(user);

  const questCategory = {
    identifier: 'quests',
    text: i18n.t('quests', language),
    items: [],
  };
  for (const key in content.quests) {
    if (content.quests[key].category === 'timeTravelers') {
      const item = getItemInfo(user, 'quests', content.quests[key], officialPinnedItems, language);
      questCategory.items.push(item);
    }
  }
  categories.push(questCategory);

  const backgroundCategory = {
    identifier: 'backgrounds',
    text: i18n.t('backgrounds', language),
    items: [],
  };
  for (const bg in content.backgrounds.timeTravelBackgrounds) {
    if (!user.purchased.background[bg]) {
      const item = getItemInfo(
        user,
        'background',
        content.backgroundsFlat[bg],
        officialPinnedItems,
        language,
      );
      backgroundCategory.items.push(item);
    }
  }
  if (backgroundCategory.items.length > 0) {
    categories.push(backgroundCategory);
  }

  for (const type of Object.keys(stable)) {
    const category = {
      identifier: type,
      text: i18n.t(type, language),
      items: [],
    };

    for (const key of Object.keys(content.timeTravelStable[type])) {
      if (!user.items[type][key]) {
        const item = getItemInfo(user, 'timeTravelersStable', {
          key,
          type,
        }, officialPinnedItems, language);
        category.items.push(item);
      }
    }

    if (category.items.length > 0) {
      categories.push(category);
    }
  }
  const sets = content.timeTravelerStore(user, new Date());
  const availabilityMatchers = getScheduleMatchingGroup('timeTravelers');
  for (const setKey of Object.keys(sets)) {
    const set = sets[setKey];
    const category = {
      identifier: set.key,
      text: set.text(language),
      path: `mystery.${set.key}`,
      pinType: 'mystery_set',
      purchaseAll: true,
    };

    if (!set.key.startsWith('30')) {
      category.end = availabilityMatchers.end;
    }

    category.items = map(set.items, item => {
      const shopItem = {
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
      if (!item.set.startsWith('mystery-30')) {
        shopItem.end = availabilityMatchers.end;
      }
      return shopItem;
    });
    if (category.items.length > 0) {
      categories.push(category);
    }
  }

  return categories;
};

/* Seasonal */

const flatGearArray = toArray(content.gear.flat);

shops.getSeasonalGearBySet = function getSeasonalGearBySet (
  user,
  shopConfig,
  set,
  officialPinnedItems,
  language,
  gearMatcher,
  ignoreAlreadyOwned = false,
) {
  return flatGearArray.filter(gear => {
    if (!ignoreAlreadyOwned && user.items.gear.owned[gear.key] !== undefined) return false;

    return gear.set === set;
  }).map(gear => {
    const currentSet = gear.set === shopConfig.pinnedSets[gear.specialClass];

    // only the current season set can be purchased by gold
    const itemInfo = getItemInfo(null, currentSet ? 'marketGear' : 'gear', gear, officialPinnedItems, language, gearMatcher);
    itemInfo.locked = currentSet && user.stats.class !== gear.specialClass;

    // gear that has previously been owned should be repurchaseable with gold
    if (user.items.gear.owned[gear.key] !== undefined) {
      itemInfo.currency = 'gold';
    }

    return itemInfo;
  });
};

shops.getSeasonalShop = function getSeasonalShop (user, language) {
  const shopConfig = seasonalShopConfig();
  const officialPinnedItems = getOfficialPinnedItems(user);

  const resObject = {
    identifier: 'seasonalShop',
    text: i18n.t('seasonalShop'),
    notes: i18n.t(`seasonalShop${shopConfig.currentSeason}Text`),
    imageName: 'seasonalshop_open',
    opened: true,
    categories: this.getSeasonalShopCategories(user, language, shopConfig),
    featured: {
      text: i18n.t(shopConfig.featuredSet(user)),
      items: officialPinnedItems.map(i => getItemInfo(user, i.type, get(content, i.path))),
    },
  };

  return resObject;
};

shops.getSeasonalShopCategories = function getSeasonalShopCategories (user, language, shopConfig) {
  const officialPinnedItems = getOfficialPinnedItems(user);

  const spellMatcher = getScheduleMatchingGroup('seasonalSpells');
  const questMatcher = getScheduleMatchingGroup('seasonalQuests');
  const gearMatcher = getScheduleMatchingGroup('seasonalGear');

  const categories = [];

  const spells = pickBy(
    content.spells.special,
    (spell, key) => spellMatcher.match(key),
  );

  if (keys(spells).length > 0) {
    const category = {
      identifier: 'spells',
      text: i18n.t('seasonalItems', language),
    };

    category.items = map(
      spells,
      spell => getItemInfo(user, 'seasonalSpell', spell, officialPinnedItems, language, spellMatcher),
    );

    categories.push(category);
  }

  const quests = pickBy(content.quests, (quest, key) => questMatcher.match(key));

  if (keys(quests).length > 0) {
    const category = {
      identifier: 'quests',
      text: i18n.t('quests', language),
    };

    category.items = map(quests, quest => getItemInfo(user, 'seasonalQuest', quest, officialPinnedItems, language, questMatcher));

    categories.push(category);
  }

  for (const set of gearMatcher.items) {
    const category = {
      identifier: set,
      text: i18n.t(set),
    };

    category.items = shops.getSeasonalGearBySet(
      user,
      shopConfig,
      set,
      officialPinnedItems,
      language,
      gearMatcher,
      false,
    );

    if (category.items.length > 0) {
      const item = category.items[0];

      category.specialClass = item.specialClass;
      categories.push(category);
    }
  }

  return categories;
};

shops.getBackgroundShopSets = function getBackgroundShopSets (language) {
  const sets = [];
  const officialPinnedItems = getOfficialPinnedItems();

  const matchers = getScheduleMatchingGroup('backgrounds');
  eachRight(content.backgrounds, (group, key) => {
    if (matchers.match(key)) {
      const set = {
        identifier: key,
        text: i18n.t(key, language),
      };

      set.items = map(group, background => getItemInfo(null, 'background', background, officialPinnedItems, language, matchers));

      sets.push(set);
    }
  });

  return sets;
};

/* Customization Shop */

shops.getCustomizationsShop = function getCustomizationsShop (user, language) {
  return {
    identifier: 'customizationsShop',
    text: i18n.t('titleCustomizations'),
    notes: i18n.t('customizationsShopText'),
    imageName: 'npc_customizations',
    categories: shops.getCustomizationsShopCategories(user, language),
  };
};

shops.getCustomizationsShopCategories = function getCustomizationsShopCategories (user, language) {
  const categories = [];
  const officialPinnedItems = getOfficialPinnedItems(user);

  const matchers = getScheduleMatchingGroup('backgrounds');
  const backgroundCategory = {
    identifier: 'backgrounds',
    text: i18n.t('backgrounds', language),
    items: [],
    end: matchers.end,
  };

  eachRight(content.backgrounds, (group, key) => {
    if (matchers.match(key)) {
      each(group, bg => {
        if (!user.purchased.background[bg.key]) {
          const item = getItemInfo(
            user,
            'background',
            bg,
            officialPinnedItems,
            language,
            matchers,
          );
          backgroundCategory.items.push(item);
        }
      });
    }
  });
  categories.push(backgroundCategory);

  const facialHairCategory = {
    identifier: 'facialHair',
    text: i18n.t('titleFacialHair', language),
    items: [],
  };
  const customizationMatcher = getScheduleMatchingGroup('customizations');
  each(['color', 'base', 'mustache', 'beard'], hairType => {
    let category;
    if (hairType === 'beard' || hairType === 'mustache') {
      category = facialHairCategory;
    } else {
      category = {
        identifier: hairType,
        text: i18n.t(`titleHair${hairType}`, language),
        items: [],
      };

      if (hairType === 'color') {
        category.end = customizationMatcher.end;
      }
    }
    eachRight(content.appearances.hair[hairType], (hairStyle, key) => {
      if (hairStyle.price > 0 && (!user.purchased.hair || !user.purchased.hair[hairType]
          || !user.purchased.hair[hairType][key])
          && customizationMatcher.match(hairStyle.set.key)) {
        const item = getItemInfo(
          user,
          `hair${hairType}`,
          hairStyle,
          officialPinnedItems,
          language,
          hairType === 'color' ? customizationMatcher : null,
        );
        category.items.push(item);
      }
    });
    // only add the facial hair category once
    if (hairType !== 'beard') {
      categories.push(category);
    }
  });

  let shirtsCategory; // shirts need to be at end
  each(['shirt', 'skin'], type => {
    const category = {
      identifier: type,
      text: i18n.t(`${type}s`, language),
      items: [],
    };
    eachRight(content.appearances[type], (appearance, key) => {
      if (appearance.price > 0 && (!user.purchased[type] || !user.purchased[type][key])
          && customizationMatcher.match(appearance.set.key)) {
        const item = getItemInfo(
          user,
          type,
          appearance,
          officialPinnedItems,
          language,
          type === 'skin' ? customizationMatcher : null,
        );
        category.items.push(item);
      }
    });
    if (type === 'skin') {
      category.end = customizationMatcher.end;
      categories.push(category);
    } else {
      shirtsCategory = category;
    }
  });

  const animalEarsCategory = {
    identifier: 'animalEars',
    text: i18n.t('animalEars', language),
  };
  animalEarsCategory.items = values(content.gear.tree.headAccessory.special)
    .filter(gearItem => {
      const { owned } = user.items.gear;
      if (typeof owned[gearItem.key] !== 'undefined') {
        return false;
      }
      return gearItem.gearSet === 'animal';
    })
    .map(gearItem => getItemInfo(user, 'gear', gearItem, officialPinnedItems, language));
  categories.push(animalEarsCategory);

  const animalTailsCategory = {
    identifier: 'animalTails',
    text: i18n.t('animalTails', language),
  };
  animalTailsCategory.items = values(content.gear.tree.back.special)
    .filter(gearItem => {
      const { owned } = user.items.gear;
      if (typeof owned[gearItem.key] !== 'undefined') {
        return false;
      }
      return gearItem.gearSet === 'animal';
    })
    .map(gearItem => getItemInfo(user, 'gear', gearItem, officialPinnedItems, language));
  categories.push(animalTailsCategory);

  categories.push(shirtsCategory);

  return categories;
};

export default shops;
