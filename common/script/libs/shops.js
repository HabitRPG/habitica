import _ from 'lodash';
import content from '../content/index';
import i18n from '../../../common/script/i18n';

let shops = {};

function lockQuest(quest, user) {
  if (quest.lvl && user.stats.lvl < quest.lvl) return true;
  if (user.achievements.quests) return (quest.previous && !user.achievements.quests[quest.previous]);
  return (quest.previous);
}

shops.getMarketCategories = function getMarket (user, language) {
  let categories = [];
  let eggsCategory = {
    identifier: 'eggs',
    text: i18n.t('eggs', language),
    notes: i18n.t('dropsExplanation', language),
  };
  eggsCategory.items = _(content.questEggs).values().filter(egg => egg.canBuy(user)).concat(_.values(content.dropEggs)).map(egg => {
    return {
      key: egg.key,
      text: i18n.t('egg', {eggType: egg.text()}, language),
      notes: egg.notes(language),
      value: egg.value,
      class: 'Pet_Egg_'+egg.key,
      locked: false,
      currency: 'gems',
    }
  }).sortBy('key').value();
  categories.push(eggsCategory);

  let hatchingPotionsCategory = {
    identifier: 'hatchingPotions',
    text: i18n.t('hatchingPotions', language),
    notes: i18n.t('dropsExplanation', language),
  };
  hatchingPotionsCategory.items = _(content.hatchingPotions).values().filter(hp => !hp.limited).map(hatchingPotion => {
    return {
      key: hatchingPotion.key,
      text: hatchingPotion.text(language),
      notes: hatchingPotion.notes(language),
      class: 'Pet_HatchingPotion_' + hatchingPotion.key,
      value: hatchingPotion.value,
      locked: false,
      currency: 'gems',
    }
  }).sortBy('key').value();
  categories.push(hatchingPotionsCategory);

  let foodCategory = {
    identifier: 'food',
    text: i18n.t('food', language),
    notes: i18n.t('dropsExplanation', language),
  };
  foodCategory.items = _(content.food).values().filter(food => food.canDrop || food.key === 'Saddle').map(foodItem => {
    return {
      key: foodItem.key,
      text: foodItem.text(language),
      notes: foodItem.notes(language),
      class: 'Pet_Food_'+foodItem.key,
      value: foodItem.value,
      locked: false,
      currency: 'gems',
  }
  }).sortBy('key').value();
  categories.push(foodCategory);

  return categories;
};

shops.getMemoizedMarketCategories = _.memoize(shops.getMarketCategories);


shops.getQuestShopCategories = function getQuestShopCategories (user, language) {
  let categories = [];

  _.each(content.userCanOwnQuestCategories, type => {
    let category = {
      identifier: type,
      text: i18n.t(type+"Quests", language)
    };

    category.items = _(content.questsByLevel).filter(quest => (quest.canBuy(user) && quest.category === type)).map(quest => {
      return {
        key: quest.key,
        text: quest.text(language),
        notes: quest.notes(language),
        value: quest.value,
        locked: lockQuest(quest, user),
        unlockCondition: quest.unlockCondition,
        drop: quest.drop,
        boss: quest.boss,
        collect: quest.collect,
        lvl: quest.lvl,
      }
    }).value();

    categories.push(category);
  });

  return categories;
};

shops.getMemoizedQuestShopCategories = _.memoize(shops.getQuestShopCategories);


shops.getTimeTravelerCategories = function getTimeTravelerCategories (language, user) {

};

shops.getMemoizedTimeTravelerCategories = _.memoize(shops.getTimeTravelerCategories);


shops.getSeasonalShopCategories = function getSeasonalShopCategories (language) {
  let availableSets = {
    summerWarrior:i18n.t("daringSwashbucklerSet", language),
    summerMage:i18n.t("emeraldMermageSet", language),
    summerHealer:i18n.t("reefSeahealerSet", language),
    summerRogue:i18n.t("roguishPirateSet", language),
    summer2015Warrior:i18n.t("sunfishWarriorSet", language),
    summer2015Mage:i18n.t("shipSoothsayerSet", language),
    summer2015Healer:i18n.t("strappingSailorSet", language),
    summer2015Rogue:i18n.t("reefRenegadeSet", language)
  };

  let categories = [];

  for (let key in availableSets) {
    let category = {
      identifier: key,
      text: availableSets[key]
    };

    var flatGearArray = _.toArray(content.gear.flat);

    category.items = _(flatGearArray).where({index: key}).map(gear => {
      return {
        key: gear.key,
        text: gear.text(language),
        notes: gear.notes(language),
        value: gear.value,
        type: gear.type,
        specialClass: gear.specialClass,
        locked: false,
        currency: 'gems'
      };
    }).value();
    categories.push(category);
  }

  return categories;
};

shops.getMemoizedSeasonalShopCategories = _.memoize(shops.getSeasonalShopCategories);


module.exports = shops;