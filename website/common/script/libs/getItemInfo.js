import i18n from '../i18n';

const types = {};

types.egg = function getEggInfo (egg, language = 'en') {
  return {
    key: egg.key,
    text: i18n.t('egg', {eggType: egg.text()}, language),
    notes: egg.notes(language),
    value: egg.value,
    class: `Pet_Egg_${egg.key}`,
    locked: false,
    currency: 'gems',
    purchaseType: 'eggs',
    path: `eggs.${egg.key}`,
  };
};

types.hatchingPotion = function getHatchingPotionInfo (hatchingPotion, language = 'en') {
  return {
    key: hatchingPotion.key,
    text: i18n.t('potion', {potionType: hatchingPotion.text(language)}),
    notes: hatchingPotion.notes(language),
    class: `Pet_HatchingPotion_${hatchingPotion.key}`,
    value: hatchingPotion.value,
    locked: false,
    currency: 'gems',
    purchaseType: 'hatchingPotions',
    path: `hatchingPotions.${hatchingPotion.key}`,
  };
};

types.premiumHatchingPotion = function getPremiumHatchingPotionInfo (premiumHatchingPotion, language = 'en') {
  return {
    key: premiumHatchingPotion.key,
    text: i18n.t('potion', {potionType: premiumHatchingPotion.text(language)}),
    notes: `${premiumHatchingPotion.notes(language)} ${premiumHatchingPotion._addlNotes(language)}`,
    class: `Pet_HatchingPotion_${premiumHatchingPotion.key}`,
    value: premiumHatchingPotion.value,
    locked: false,
    currency: 'gems',
    purchaseType: 'hatchingPotions',
    path: `premiumHatchingPotions.${premiumHatchingPotion.key}`,
  };
};

types.food = function getFoodInfo (foodItem, language = 'en') {
  return {
    key: foodItem.key,
    text: foodItem.text(language),
    notes: foodItem.notes(language),
    class: `Pet_Food_${foodItem.key}`,
    value: foodItem.value,
    locked: false,
    currency: 'gems',
    purchaseType: 'food',
    path: `food.${foodItem.key}`,
  };
};

types.questBundle = function getQuestBundleInfo (bundle, language = 'en') {
  return {
    key: bundle.key,
    text: bundle.text(language),
    notes: bundle.notes(language),
    value: bundle.value,
    currency: 'gems',
    class: `quest_bundle_${bundle.key}`,
    purchaseType: 'bundles',
    path: `bundles.${bundle.key}`,
  };
};

function lockQuest (quest, user) {
  if (quest.lvl && user.stats.lvl < quest.lvl) return true;
  if (quest.unlockCondition && (quest.key === 'moon1' || quest.key === 'moon2' || quest.key === 'moon3')) {
    return user.loginIncentives < quest.unlockCondition.incentiveThreshold;
  }
  if (user.achievements.quests) return quest.previous && !user.achievements.quests[quest.previous];
  return quest.previous;
}

types.quest = function getQuestInfo (quest, user, language = 'en') {
  const locked = lockQuest(quest, user);

  return {
    key: quest.key,
    text: quest.text(language),
    notes: quest.notes(language),
    group: quest.group,
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
    path: `quests.${quest.key}`,
  };
};

// TODO time travelers

types.seasonalSpell = function getSeasonalSpellInfo (spell, language = 'en') {
  return {
    key: spell.keyspellKey,
    text: spell.text(language),
    notes: spell.notes(language),
    value: spell.value,
    type: 'special',
    currency: 'gold',
    locked: false,
    purchaseType: 'spells',
    class: `inventory_special_${spell.key}`,
    path: `spells.special.${spell.key}`,
  };
};

types.seasonalQuest = function getSeasonalQuestInfo (quest, language = 'en') {
  return {
    key: quest.key,
    text: quest.text(language),
    notes: quest.notes(language),
    value: quest.value,
    type: 'quests',
    currency: 'gems',
    locked: false,
    drop: quest.drop,
    boss: quest.boss,
    collect: quest.collect,
    class: `inventory_quest_scroll_${quest.key}`,
    purchaseType: 'quests',
    path: `quests.${quest.key}`,
  };
};

types.gear = function getGearInfo (gear, language = 'en') {
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
    path: `gear.flat.${gear.key}`,
  };
};

types.backgrund = function getBackgroundInfo (background, language = 'en') {
  return {
    key: background.key,
    text: background.text(language),
    notes: background.notes(language),
    value: background.price,
    currency: background.currency || 'gems',
    purchaseType: 'backgrounds',
    path: `backgrounds.${background.set}.${background.key}`,
  };
};


module.exports = types;