import _mapValues from 'lodash/mapValues';
import i18n from '../i18n';
import content from '../content/index';
import { BadRequest } from './errors';
import * as count from '../count';

import isPinned from './isPinned';
import isFreeRebirth from './isFreeRebirth';
import getOfficialPinnedItems from './getOfficialPinnedItems';

function lockQuest (quest, user) {
  // checks series quests, including Masterclasser
  if (quest.prereqQuests) {
    if (!user.achievements.quests) return true;
    for (const prereq of quest.prereqQuests) {
      if (!user.achievements.quests[prereq]) return true;
    }
  }
  // checks quest & user level against quest level
  if (quest.lvl && user.stats.lvl < quest.lvl) return true;

  // checks unlockCondition.incentiveThreshold for Lunar Battle
  if (
    quest.unlockCondition
    && quest.unlockCondition.incentiveThreshold
    && user.loginIncentives < quest.unlockCondition.incentiveThreshold
  ) return true;
  // // then if we've passed all the checks
  return false;
}

function isItemSuggested (officialPinnedItems, itemInfo) {
  return officialPinnedItems.findIndex(officialItem => { // eslint-disable-line arrow-body-style
    return officialItem.type === itemInfo.pinType && officialItem.path === itemInfo.path;
  }) > -1;
}

function getDefaultGearProps (item, language) {
  return {
    key: item.key,
    text: item.text(language),
    notes: item.notes(language),
    type: item.type,
    specialClass: item.specialClass,
    locked: false,
    purchaseType: 'gear',
    class: `shop_${item.key}`,
    path: `gear.flat.${item.key}`,
    str: item.str,
    int: item.int,
    per: item.per,
    con: item.con,
    klass: item.klass,
    event: item.event,
    set: item.set,
  };
}

export default function getItemInfo (user, type, item, officialPinnedItems, language = 'en') {
  if (officialPinnedItems === undefined) {
    officialPinnedItems = getOfficialPinnedItems(user); // eslint-disable-line no-param-reassign
  }

  let itemInfo;

  switch (type) { // eslint-disable-line default-case
    case 'eggs':
      itemInfo = {
        key: item.key,
        text: i18n.t('egg', { eggType: item.text(language) }, language),
        notes: item.notes(language),
        value: item.value,
        class: `Pet_Egg_${item.key}`,
        locked: false,
        currency: 'gems',
        purchaseType: 'eggs',
        path: `eggs.${item.key}`,
        pinType: 'eggs',
      };
      break;
    case 'hatchingPotions':
      itemInfo = {
        key: item.key,
        text: i18n.t('potion', { potionType: item.text(language) }),
        notes: item.notes(language),
        class: `Pet_HatchingPotion_${item.key}`,
        value: item.value,
        locked: false,
        currency: 'gems',
        purchaseType: 'hatchingPotions',
        path: `hatchingPotions.${item.key}`,
        pinType: 'hatchingPotions',
      };
      break;
    case 'premiumHatchingPotion':
      itemInfo = {
        key: item.key,
        text: i18n.t('potion', { potionType: item.text(language) }),
        notes: `${item.notes(language)} ${item._addlNotes(language)}`,
        class: `Pet_HatchingPotion_${item.key}`,
        value: item.value,
        locked: false,
        currency: 'gems',
        purchaseType: 'hatchingPotions',
        path: item.wacky ? `wackyHatchingPotions.${item.key}` : `premiumHatchingPotions.${item.key}`,
        pinType: 'premiumHatchingPotion',
        event: item.event,
      };
      break;
    case 'food':
      itemInfo = {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        class: `Pet_Food_${item.key}`,
        value: item.value,
        locked: false,
        currency: 'gems',
        purchaseType: 'food',
        path: `food.${item.key}`,
        pinType: 'food',
      };
      break;
    case 'bundles':
      itemInfo = {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        addlNotes: item.addlNotes ? item.addlNotes(language) : null,
        value: item.value,
        currency: 'gems',
        class: `quest_bundle_${item.key}`,
        purchaseType: 'bundles',
        path: `bundles.${item.key}`,
        pinType: 'bundles',
        event: item.event,
      };
      break;
    case 'quests': // eslint-disable-line no-case-declarations
      const locked = lockQuest(item, user); // eslint-disable-line no-case-declarations

      itemInfo = {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        addlNotes: item.addlNotes ? item.addlNotes(language) : null,
        group: item.group,
        event: item.event,
        value: item.goldValue ? item.goldValue : item.value,
        locked,
        previous: content.quests[item.previous]
          ? content.quests[item.previous].text(language)
          : null,
        unlockCondition: item.unlockCondition,
        completed: user.achievements.quests[item.key] !== undefined,
        drop: item.drop,
        boss: item.boss,
        collect: item.collect ? _mapValues(item.collect, o => ({
          count: o.count,
          text: o.text(),
        })) : undefined,
        lvl: item.lvl,
        class: locked ? `inventory_quest_scroll_${item.key}_locked` : `inventory_quest_scroll_${item.key}`,
        purchaseType: 'quests',
        path: `quests.${item.key}`,
        pinType: 'quests',
      };
      if (item.goldValue) {
        itemInfo.currency = 'gold';
      } else if (item.category === 'timeTravelers') {
        itemInfo.currency = 'hourglasses';
      } else {
        itemInfo.currency = 'gems';
      }

      break;
    case 'timeTravelers':
      // TODO
      itemInfo = {};
      break;
    case 'seasonalSpell':
      itemInfo = {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        value: item.value,
        type: 'special',
        currency: 'gold',
        locked: false,
        purchaseType: 'special',
        class: `inventory_special_${item.key}`,
        path: `spells.special.${item.key}`,
        pinType: 'seasonalSpell',
        event: item.event,
      };
      break;
    case 'debuffPotion':
      itemInfo = {
        key: item.key,
        mana: item.mana,
        cast: item.cast,
        immediateUse: item.immediateUse,
        target: item.target,
        text: item.text(language),
        notes: item.notes(language),
        value: item.value,
        type: 'debuffPotion',
        currency: 'gold',
        locked: false,
        purchaseType: 'debuffPotion',
        class: `shop_${item.key}`,
        path: `spells.special.${item.key}`,
        pinType: 'debuffPotion',
      };
      break;
    case 'seasonalQuest':
      itemInfo = {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        value: item.value,
        type: 'quests',
        currency: 'gems',
        locked: false,
        drop: item.drop,
        boss: item.boss,
        collect: item.collect,
        class: `inventory_quest_scroll_${item.key}`,
        purchaseType: 'quests',
        path: `quests.${item.key}`,
        pinType: 'seasonalQuest',
        event: item.event,
      };
      break;
    case 'gear':
      // spread operator not available
      itemInfo = Object.assign(getDefaultGearProps(item, language), {
        value: item.twoHanded ? 2 : 1,
        currency: 'gems',
        pinType: 'gear',
      });
      break;
    case 'marketGear':
      itemInfo = Object.assign(getDefaultGearProps(item, language), {
        value: item.value,
        currency: 'gold',
        pinType: 'marketGear',
        canOwn: item.canOwn,
      });
      break;
    case 'background':
      itemInfo = {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        class: `icon_background_${item.key}`,
        value: item.price,
        currency: item.currency || 'gems',
        purchaseType: 'backgrounds',
        path: `backgrounds.${item.set}.${item.key}`,
        pinType: 'background',
        locked: false,
      };
      break;
    case 'mystery_set':
      itemInfo = {
        items: item.items,
        key: item.key,
        text: item.text(language),
        value: 1,
        currency: 'hourglasses',
        purchaseType: 'mystery_set',
        class: `shop_set_mystery_${item.key}`,
        path: `mystery.${item.key}`,
        pinType: 'mystery_set',
      };
      break;
    case 'potion':
      itemInfo = {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        value: item.value,
        currency: 'gold',
        purchaseType: 'potion',
        class: `shop_${item.key}`,
        path: 'potion',
        pinType: 'potion',
      };
      break;
    case 'armoire':
      itemInfo = {
        key: item.key,
        text: item.text(language),
        notes: item.notes(user, count.remainingGearInSet(user.items.gear.owned, 'armoire')), // TODO count
        value: item.value,
        currency: 'gold',
        purchaseType: 'armoire',
        class: `shop_${item.key}`,
        path: 'armoire',
        pinType: 'armoire',
      };
      break;
    case 'card': {
      const spellInfo = content.spells.special[item.key];

      itemInfo = {
        key: item.key,
        purchaseType: 'card',
        class: `inventory_special_${item.key}`,
        text: spellInfo.text(),
        notes: spellInfo.notes(),
        value: spellInfo.value,
        currency: 'gold',
        path: `cardTypes.${item.key}`,
        pinType: 'card',
        target: spellInfo.target,
        cast: spellInfo.cast,
      };
      break;
    }
    case 'gem': {
      itemInfo = {
        key: 'gem',
        purchaseType: 'gems',
        class: 'shop_gem',
        text: i18n.t('subGemName'),
        notes: i18n.t('subGemPop'),
        value: 20,
        currency: 'gold',
        path: 'special.gems',
        pinType: 'gem',
        locked: !user.purchased.plan.customerId,
      };
      break;
    }
    case 'rebirth_orb': {
      itemInfo = {
        key: 'rebirth_orb',
        purchaseType: 'rebirth_orb',
        class: 'rebirth_orb',
        text: i18n.t('rebirthName'),
        notes: i18n.t('rebirthPop'),
        value: isFreeRebirth(user) ? 0 : 6,
        currency: 'gems',
        path: 'special.rebirth_orb',
        pinType: 'rebirth_orb',
        locked: !user.flags.rebirthEnabled,
      };
      break;
    }
    case 'fortify': {
      itemInfo = {
        key: 'fortify',
        purchaseType: 'fortify',
        class: 'inventory_special_fortify',
        text: i18n.t('fortifyName'),
        notes: i18n.t('fortifyPop'),
        value: 4,
        currency: 'gems',
        path: 'special.fortify',
        pinType: 'fortify',
      };
      break;
    }
    case 'timeTravelersStable': {
      itemInfo = {
        key: item.key,
        purchaseType: item.type,
        class: `shop_${item.type}_${item.key}`,
        text: content.timeTravelStable[item.type][item.key](language),
        notes: '',
        value: 1,

        locked: false,
        currency: 'hourglasses',
        path: `timeTravelStable.${item.type}.${item.key}`,
        pinType: 'timeTravelersStable',
      };
      break;
    }
  }

  if (itemInfo) {
    itemInfo.isSuggested = isItemSuggested(officialPinnedItems, itemInfo);
    itemInfo.pinned = isPinned(user, itemInfo, officialPinnedItems);
  } else {
    throw new BadRequest(i18n.t('wrongItemType', { type }, language));
  }

  return itemInfo;
}
