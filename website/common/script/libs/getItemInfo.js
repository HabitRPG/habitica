import i18n from '../i18n';

function lockQuest (quest, user) {
  if (quest.lvl && user.stats.lvl < quest.lvl) return true;
  if (quest.unlockCondition && (quest.key === 'moon1' || quest.key === 'moon2' || quest.key === 'moon3')) {
    return user.loginIncentives < quest.unlockCondition.incentiveThreshold;
  }
  if (user.achievements.quests) return quest.previous && !user.achievements.quests[quest.previous];
  return quest.previous;
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
  };
}

module.exports = function getItemInfo (user, type, item, language = 'en') {
  switch (type) {
    case 'egg':
      return {
        key: item.key,
        text: i18n.t('egg', {eggType: item.text(language)}, language),
        notes: item.notes(language),
        value: item.value,
        class: `Pet_Egg_${item.key}`,
        locked: false,
        currency: 'gems',
        purchaseType: 'eggs',
        path: `eggs.${item.key}`,
        pinType: 'egg',
      };
    case 'hatchingPotion':
      return {
        key: item.key,
        text: i18n.t('potion', {potionType: item.text(language)}),
        notes: item.notes(language),
        class: `Pet_HatchingPotion_${item.key}`,
        value: item.value,
        locked: false,
        currency: 'gems',
        purchaseType: 'hatchingPotions',
        path: `hatchingPotions.${item.key}`,
        pinType: 'hatchingPotion',
      };
    case 'premiumHatchingPotion':
      return {
        key: item.key,
        text: i18n.t('potion', {potionType: item.text(language)}),
        notes: `${item.notes(language)} ${item._addlNotes(language)}`,
        class: `Pet_HatchingPotion_${item.key}`,
        value: item.value,
        locked: false,
        currency: 'gems',
        purchaseType: 'hatchingPotions',
        path: `premiumHatchingPotions.${item.key}`,
        pinType: 'premiumHatchingPotion',
      };
    case 'food':
      return {
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
    case 'questBundle':
      return {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        value: item.value,
        currency: 'gems',
        class: `quest_bundle_${item.key}`,
        purchaseType: 'bundles',
        path: `bundles.${item.key}`,
        pinType: 'questBundle',
      };
    case 'quest': // eslint-disable-line no-case-declarations
      const locked = lockQuest(item, user);

      return {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        group: item.group,
        value: item.goldValue ? item.goldValue : item.value,
        currency: item.goldValue ? 'gold' : 'gems',
        locked,
        unlockCondition: item.unlockCondition,
        drop: item.drop,
        boss: item.boss,
        collect: item.collect,
        lvl: item.lvl,
        class: locked ? `inventory_quest_scroll_locked inventory_quest_scroll_${item.key}_locked` : `inventory_quest_scroll inventory_quest_scroll_${item.key}`,
        purchaseType: 'quests',
        path: `quests.${item.key}`,
        pinType: 'quest',
      };
    case 'timeTravelers':
      // TODO
      return {};
    case 'seasonalSpell':
      return {
        key: item.keyspellKey,
        text: item.text(language),
        notes: item.notes(language),
        value: item.value,
        type: 'special',
        currency: 'gold',
        locked: false,
        purchaseType: 'spells',
        class: `inventory_special_${item.key}`,
        path: `spells.special.${item.key}`,
        pinType: 'seasonalSpell',
      };
    case 'seasonalQuest':
      return {
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
      };
    case 'gear':
      // spread operator not available
      return Object.assign(getDefaultGearProps(item, language), {
        value: item.twoHanded ? 2 : 1,
        currency: 'gems',
        pinType: 'gear',
      });
    case 'marketGear':
      return Object.assign(getDefaultGearProps(item, language), {
        value: item.value,
        currency: 'gold',
        pinType: 'marketGear',
      });
    case 'background':
      return {
        key: item.key,
        text: item.text(language),
        notes: item.notes(language),
        class: `icon_background_${item.key}`,
        value: item.price,
        currency: item.currency || 'gems',
        purchaseType: 'backgrounds',
        path: `backgrounds.${item.set}.${item.key}`,
        pinType: 'background',
      };
    case 'mystery_set':
      return {
        key: item.key,
        text: item.text(language),
        value: 1,
        currency: 'hourglasses',
        purchaseType: 'mystery_set',
        path: `mystery.${item.key}`,
        pinType: 'mystery_set',
      };
  }
};
